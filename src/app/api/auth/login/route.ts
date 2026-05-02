// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
    decodeJwtPayload,
    pickTokenFromPayload,
    COOKIE_NAME,
    COOKIE_MAX_AGE_CAP,
    extractClientIp,
    resolveIpGeo
} from "@/lib/auth-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cookieMaxAgeFromJwt(token: string): number {
    const payload = decodeJwtPayload(token);
    const exp = Number(payload?.exp); // exp is usually seconds since epoch
    const now = Math.floor(Date.now() / 1000);

    if (Number.isFinite(exp) && exp > now + 5) {
        const delta = exp - now;
        return Math.max(60, Math.min(delta, COOKIE_MAX_AGE_CAP)); // at least 60s
    }

    return COOKIE_MAX_AGE_CAP;
}

// --- In-memory lockout tracking ---
interface LockoutInfo {
    attempts: number;
    lockedUntil: number | null;
}
const lockoutMap = new Map<string, LockoutInfo>();

const MAX_ATTEMPTS = 5;

/** Returns lockout duration in ms based on failed attempt count */
function getLockoutDuration(attempts: number): number {
    if (attempts >= 7) return 30 * 60 * 1000; // 30 minutes
    if (attempts >= 6) return 10 * 60 * 1000; // 10 minutes
    return 5 * 60 * 1000;                      //  5 minutes (5 attempts)
}

function normalizeLoginErrorMessage(status: number): string {
    if (status === 401) return "Credentials invalid.";
    if (status === 429) return "The account has been blocked, please contact the administrator.";
    if (status >= 500) return "Server is down, please contact Administrator.";
    return `Login failed (HTTP ${status}).`;
}

async function throttle() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
}

export async function POST(req: NextRequest) {
    const userAgent = req.headers.get("user-agent") || "unknown";

    const baseUrl = process.env.SPRING_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json(
            { ok: false, message: "Server misconfigured." },
            { status: 500 }
        );
    }

    const body = await req.json().catch(() => null);

    const email = String(body?.email ?? "").trim();
    const hashPassword = String(body?.hashPassword ?? body?.password ?? "").trim();
    const remember = Boolean(body?.remember);
    let latitude = typeof body?.latitude === "number" && Number.isFinite(body.latitude) ? body.latitude : null;
    let longitude = typeof body?.longitude === "number" && Number.isFinite(body.longitude) ? body.longitude : null;

    if (!email || !hashPassword) {
        return NextResponse.json(
            { ok: false, message: 'Both "email" and "hashPassword" are required.' },
            { status: 400 }
        );
    }

    // --- Check Lockout Status ---
    const lockout = lockoutMap.get(email);
    if (lockout?.lockedUntil && lockout.lockedUntil > Date.now()) {
        return NextResponse.json({
            ok: false,
            message: "TOO_MANY_ATTEMPTS",
            lockedUntil: lockout.lockedUntil
        }, { status: 429 });
    }

    // IP Geolocation fallback
    if (latitude === null || longitude === null) {
        const clientIp = extractClientIp(req.headers);
        if (clientIp) {
            const geo = await resolveIpGeo(clientIp);
            if (geo) {
                latitude = geo.latitude;
                longitude = geo.longitude;
            }
        }
    }

    const loginUrl = `${baseUrl.replace(/\/$/, "")}/auth/login`;
    const springPayload = {
        email,
        hashPassword,
        rememberMe: remember,
        latitude: latitude ?? "",
        longitude: longitude ?? "",
    };

    let springRes: Response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
        springRes = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "User-Agent": userAgent,
            },
            body: JSON.stringify(springPayload),
            signal: controller.signal,
            cache: "no-store",
        });
    } catch (err: unknown) {
        console.error("[auth/login] Upstream fetch error:", err);
        await throttle();
        return NextResponse.json(
            { ok: false, message: "Server is down, please contact Administrator." },
            { status: 502 }
        );
    } finally {
        clearTimeout(timeout);
    }

    const raw = await springRes.text();
    let data: unknown = null;
    try {
        data = raw ? JSON.parse(raw) : null;
    } catch {
        data = raw;
    }

    if (!springRes.ok) {
        const m = String((data as Record<string, unknown>)?.message ?? "").toLowerCase();
        const rawAttempts = (data as Record<string, unknown>)?.attempts ?? (data as Record<string, unknown>)?.failedAttempts;
        const backendAttempts = typeof rawAttempts === 'number' ? rawAttempts : null;

        // 1. Check for Blocked status from backend (15+ attempts)
        if (m.includes("blocked") || m.includes("account_blocked") || (backendAttempts !== null && backendAttempts >= 15)) {
            return NextResponse.json({
                ok: false,
                message: "ACCOUNT_BLOCKED"
            }, { status: 403 });
        }

        // 2. Check for Locked status from backend (5-14 attempts)
        if (m.includes("locked") || m.includes("account_locked") || (data as Record<string, unknown>)?.lockUntil || (backendAttempts !== null && backendAttempts >= 5)) {
            return NextResponse.json({
                ok: false,
                message: "ACCOUNT_LOCKED",
                lockedUntil: (data as Record<string, unknown>)?.lockUntil
                    ? new Date(String((data as Record<string, unknown>).lockUntil)).getTime()
                    : Date.now() + getLockoutDuration(backendAttempts ?? 5),
                attempts: backendAttempts
            }, { status: 423 }); // 423 Locked
        }

        // 3. Handle standard failure with remaining attempts calculation
        let remainingToLock = null;
        let remainingToBlock = null;

        if (backendAttempts !== null) {
            remainingToLock = Math.max(0, 5 - backendAttempts);
            remainingToBlock = Math.max(0, 15 - backendAttempts);
        } else {
            // Fallback to local in-memory lockout tracking
            const current = lockoutMap.get(email) || { attempts: 0, lockedUntil: null };
            current.attempts += 1;
            if (current.attempts >= MAX_ATTEMPTS) {
                current.lockedUntil = Date.now() + getLockoutDuration(current.attempts);
            }
            lockoutMap.set(email, current);
            remainingToLock = Math.max(0, MAX_ATTEMPTS - current.attempts);
        }

        const msg = normalizeLoginErrorMessage(springRes.status);

        await throttle();
        return NextResponse.json({
            ok: false,
            message: msg,
            remainingAttempts: remainingToLock, // For the "X attempts remaining" toast
            remainingUntilBlock: remainingToBlock,
            attempts: backendAttempts
        }, { status: springRes.status });
    }

    lockoutMap.delete(email);

    const dataObj = (data && typeof data === "object" && "data" in (data as object)) ? (data as Record<string, unknown>).data : data;
    const token = pickTokenFromPayload(dataObj as string | Record<string, unknown> | null);

    if (!token) {
        return NextResponse.json(
            { ok: false, message: "Login succeeded but no token was returned." },
            { status: 502 }
        );
    }

    // --- Handle Forced Password Reset ---
    if (token === "PASSWORD_RESET_REQUIRED") {
        return NextResponse.json({
            ok: false,
            message: "PASSWORD_RESET_REQUIRED"
        }, { status: 403 });
    }

    const backendExp = (data as Record<string, unknown>)?.rememberMeExpiration ?? (data as Record<string, Record<string, unknown>>)?.data?.rememberMeExpiration;
    const cookieMaxAge = typeof backendExp === "number" ? backendExp : cookieMaxAgeFromJwt(token);

    const decoded = decodeJwtPayload(token);

    const res = NextResponse.json(
        {
            ok: true,
            user: {
                firstName: decoded?.FirstName || "",
                lastName: decoded?.LastName || "",
                email: decoded?.email || "",
                role: decoded?.role || ""
            }
        },
        { headers: { "Cache-Control": "no-store" } }
    );

    res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        // secure: process.env.NODE_ENV === "production",

        // for development only to allow cookies to work on http
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        path: "/",
        ...(remember ? { maxAge: cookieMaxAge } : {}),
    });

    if (latitude !== null && longitude !== null) {
        res.cookies.set({
            name: "user_latitude",
            value: String(latitude),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            ...(remember ? { maxAge: cookieMaxAge } : {}),
        });
        res.cookies.set({
            name: "user_longitude",
            value: String(longitude),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            ...(remember ? { maxAge: cookieMaxAge } : {}),
        });
    }

    return res;
}
