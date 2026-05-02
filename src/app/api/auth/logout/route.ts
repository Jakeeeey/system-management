import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, SPRING_COOKIE_NAME, LAST_VISITED_PATH_COOKIE } from "@/lib/auth-utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
    const userAgent = req.headers.get("user-agent") || "unknown";
    const baseUrl = process.env.SPRING_API_BASE_URL;
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (baseUrl && token) {
        try {
            console.info("[auth/logout] Notifying upstream at:", `${baseUrl.replace(/\/$/, "")}/auth/logout`);

            await fetch(`${baseUrl.replace(/\/$/, "")}/auth/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "User-Agent": userAgent,
                },
                // Add a short timeout to prevent hanging the logout flow
                signal: AbortSignal.timeout(5000),
            });
        } catch (error) {
            // Log but don't block the frontend logout
            console.error("[auth/logout] Upstream logout error (non-fatal):", error);
        }
    }

    const res = NextResponse.json({ ok: true })

    // Clear main VOS cookie
    res.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    })

    // Clear secondary springboot cookie
    res.cookies.set({
        name: SPRING_COOKIE_NAME,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    })

    // Clear last visited path cookie
    res.cookies.set({
        name: LAST_VISITED_PATH_COOKIE,
        value: "",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    })

    return res
}
