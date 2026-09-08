import { TicketList } from "@/modules/system-management/ticket/components/TicketList";
import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavUser } from "@/components/shared/app-sidebar/nav-user";
import { cookies } from "next/headers";

const COOKIE_NAME = "vos_access_token";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
        const json = Buffer.from(padded, "base64").toString("utf8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function buildHeaderUserFromToken(token: string | null | undefined) {
    const payload = token ? decodeJwtPayload(token) : null;
    const first = payload?.Firstname || payload?.FirstName || payload?.firstName || payload?.firstname || payload?.first_name;
    const last = payload?.LastName || payload?.Lastname || payload?.lastName || payload?.lastname || payload?.last_name;
    const email = payload?.email || payload?.Email;
    
    const fStr = typeof first === 'string' ? first : undefined;
    const lStr = typeof last === 'string' ? last : undefined;
    const eStr = typeof email === 'string' ? email : undefined;
    
    const name = [fStr, lStr].filter(Boolean).join(" ") || eStr || "User";
    return { name, email: eStr || "", avatar: "" };
}

export default async function MyTicketPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
    const headerUser = buildHeaderUserFromToken(token);
    
    const payload = token ? decodeJwtPayload(token) : null;
    const userIdStr = payload?.id || payload?.user_id || payload?.sub;
    const userId = userIdStr ? Number(userIdStr) : undefined;

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b shadow-sm bg-background sm:h-16 overflow-hidden">
                <div className="flex h-full min-w-0 items-center gap-2 px-3 sm:px-4 overflow-hidden">
                    <SidebarTrigger className="-ml-1 shrink-0" />
                    <Separator orientation="vertical" className="hidden sm:block mr-2 h-4 shrink-0" />
                    <div className="min-w-0 overflow-hidden">
                        <Breadcrumb>
                            <BreadcrumbList className="min-w-0 overflow-hidden">
                                <BreadcrumbItem className="hidden md:block shrink-0">
                                    <BreadcrumbLink href="#">System Management</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block shrink-0" />
                                <BreadcrumbItem className="min-w-0 overflow-hidden">
                                    <BreadcrumbPage className="truncate max-w-[56vw] sm:max-w-[60vw] md:max-w-none">
                                        My Tickets
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>
                <div className="flex h-full items-center px-2 sm:px-4 shrink-0 max-w-[48vw] sm:max-w-none overflow-hidden">
                    <NavUser user={headerUser} />
                </div>
            </header>

            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6 bg-muted/10">
                <TicketList filterByUserId={userId} viewPathPrefix="/system-management/my-ticket" />
            </main>
        </div>
    );
}
