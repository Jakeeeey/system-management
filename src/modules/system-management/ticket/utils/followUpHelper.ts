import { Ticket } from "../types/ticket.types";

export function getFollowUpStatus(ticket: Ticket): { canFollowUp: boolean; nextFollowUpTime: Date; waitText: string } {
    let intervalHours = 3; // Low priority default
    const p = ticket.priority.toLowerCase();
    if (p === 'critical' || p === 'high') {
        intervalHours = 1;
    } else if (p === 'medium') {
        intervalHours = 2;
    }

    const baseTimeStr = ticket.followUpTimestamp || ticket.createdAt;
    // Assuming backend returns UTC string (or PHT if formatted). Directus timestamps without Z are treated as local.
    // To be safe, ensure it parses correctly by appending Z if needed, assuming the server gives UTC.
    const baseTimeMs = new Date(baseTimeStr.replace(' ', 'T') + (baseTimeStr.includes('Z') ? '' : 'Z')).getTime();
    
    const nextFollowUpMs = baseTimeMs + (intervalHours * 60 * 60 * 1000);
    const nowMs = Date.now();
    
    if (nowMs >= nextFollowUpMs) {
        return { canFollowUp: true, nextFollowUpTime: new Date(nextFollowUpMs), waitText: "" };
    }

    const diffMs = nextFollowUpMs - nowMs;
    const diffMins = Math.ceil(diffMs / (60 * 1000));
    let waitText = "";
    if (diffMins > 60) {
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        waitText = `Wait ${hrs}h ${mins}m`;
    } else {
        waitText = `Wait ${diffMins}m`;
    }

    return { canFollowUp: false, nextFollowUpTime: new Date(nextFollowUpMs), waitText };
}
