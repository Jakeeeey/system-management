"use client"

import React, { useEffect, useState, useCallback } from "react";
import { Ticket, TicketActivity } from "../types/ticket.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, ClockIcon, HashIcon, TagIcon, PaperclipIcon, BellRingIcon } from "lucide-react";
import { fetchTicketById, fetchTicketActivities, triggerTicketFollowUp } from "../actions/ticket.action";
import { getFollowUpStatus } from "../utils/followUpHelper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DIRECTUS_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function TicketDetails({ ticketId }: { ticketId: string }) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [activities, setActivities] = useState<TicketActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFollowingUp, setIsFollowingUp] = useState(false);

    const loadTicketData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Ticket
            const fetchedTicket = await fetchTicketById(ticketId);
            if (fetchedTicket) {
                setTicket(fetchedTicket);
            }

            // Fetch Activities
            const fetchedActivities = await fetchTicketActivities(ticketId);
            setActivities(fetchedActivities);
        } catch (error) {
            console.error("Error loading ticket details:", error);
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        loadTicketData();
    }, [loadTicketData]);

    const handleFollowUp = async () => {
        if (!ticket) return;
        setIsFollowingUp(true);
        try {
            const success = await triggerTicketFollowUp(ticket.ticketId);
            if (success) {
                toast.success("Follow-up requested. The Queue dashboard has been alerted.");
                loadTicketData(); // Reload to show the new activity in the timeline
            } else {
                toast.error("Failed to trigger follow-up.");
            }
        } catch (_e) {
            toast.error("An error occurred while following up.");
        } finally {
            setIsFollowingUp(false);
        }
    };

    if (loading) return <div>Loading ticket...</div>;
    if (!ticket) return <div>Ticket not found.</div>;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
            case 'in progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200';
            case 'closed': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
            case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
            case 'medium': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
            case 'low': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-sm overflow-hidden border rounded-none">
                    <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 font-mono">
                                    <HashIcon className="w-3 h-3" />
                                    <span>{ticket.ticketNumber}</span>
                                </div>
                                <CardTitle className="text-2xl font-bold tracking-tight">{ticket.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    {new Date(ticket.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    {ticket.status.toLowerCase() !== 'resolved' && ticket.status.toLowerCase() !== 'closed' && (
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="rounded-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-200 transition-colors" 
                                            onClick={handleFollowUp} 
                                            disabled={isFollowingUp || !getFollowUpStatus(ticket).canFollowUp}
                                            title={getFollowUpStatus(ticket).waitText}
                                        >
                                            <BellRingIcon className="w-4 h-4 mr-2" />
                                            {isFollowingUp ? "Sending..." : (getFollowUpStatus(ticket).canFollowUp ? "Follow Up" : getFollowUpStatus(ticket).waitText)}
                                        </Button>
                                    )}
                                    <Badge className={`font-semibold px-3 py-1 ${getStatusColor(ticket.status)}`} variant="outline">
                                        {ticket.status}
                                    </Badge>
                                </div>
                                <Badge className={`font-medium ${getPriorityColor(ticket.priority)}`} variant="secondary">
                                    {ticket.priority} Priority
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator className="opacity-50" />
                    <CardContent className="pt-6">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">{ticket.description}</p>
                        </div>
                        
                        {ticket.images && ticket.images.length > 0 && (
                            <div className="mt-8">
                                <h4 className="flex items-center gap-2 font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                                    <PaperclipIcon className="w-4 h-4" />
                                    Attachments
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {ticket.images.map((imageId) => (
                                        <div key={imageId} className="group relative aspect-square rounded-none overflow-hidden border shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={`${DIRECTUS_URL}/assets/${imageId}`}
                                                alt="Ticket attachment"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-none">View Image</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Activity Log */}
                <Card className="border rounded-none shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-muted-foreground" />
                            Activity Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {activities.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                                <ClockIcon className="w-8 h-8 mb-2 opacity-20" />
                                <p>No activities recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
                                {activities.map((activity) => (
                                    <div key={activity.activityId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-none border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <div className="w-2 h-2 rounded-none bg-primary/60"></div>
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded-none p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm">{activity.activityType}</span>
                                                <span className="text-xs text-muted-foreground font-mono">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {activity.oldStatus && activity.newStatus && (
                                                <div className="text-sm mt-2 flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs opacity-70">{activity.oldStatus}</Badge>
                                                    <span className="text-muted-foreground text-xs">→</span>
                                                    <Badge variant="outline" className="text-xs">{activity.newStatus}</Badge>
                                                </div>
                                            )}
                                            {activity.note && (
                                                <p className="text-sm bg-muted/40 p-2.5 rounded-none mt-3 italic text-foreground/80 border border-muted">&quot;{activity.note}&quot;</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Metadata */}
            <div className="space-y-6">
                <Card className="border rounded-none shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <TagIcon className="w-4 h-4" />
                            Ticket Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/50">
                            <div className="p-4 hover:bg-muted/20 transition-colors">
                                <span className="text-xs text-muted-foreground block mb-1 uppercase font-semibold">Category</span>
                                <div className="font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    {ticket.category?.categoryName || "Uncategorized"}
                                </div>
                            </div>
                            <div className="p-4 hover:bg-muted/20 transition-colors">
                                <span className="text-xs text-muted-foreground block mb-2 uppercase font-semibold">Assigned To</span>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {(ticket.assigneeName || "U").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-sm">{ticket.assigneeName || "Unassigned"}</span>
                                </div>
                            </div>
                            <div className="p-4 hover:bg-muted/20 transition-colors">
                                <span className="text-xs text-muted-foreground block mb-2 uppercase font-semibold">Reporter</span>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback className="bg-slate-100 text-slate-500 text-xs">
                                            {(ticket.reporterName || "R").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{ticket.reporterName || "Unknown Reporter"}</div>
                                        {ticket.reporterDescription && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{ticket.reporterDescription}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
