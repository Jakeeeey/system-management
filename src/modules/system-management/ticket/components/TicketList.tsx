"use client"

import React, { useEffect, useState } from "react";
import { Ticket } from "../types/ticket.types";
import { fetchTickets, triggerTicketFollowUp } from "../actions/ticket.action";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusIcon, EyeIcon, TicketIcon, BellRingIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription as UIDialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TicketForm } from "./TicketForm";
import { getFollowUpStatus } from "../utils/followUpHelper";
import { toast } from "sonner";

export function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await fetchTickets();
            setTickets(data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowUp = async (ticket: Ticket) => {
        try {
            const success = await triggerTicketFollowUp(ticket.ticketId);
            if (success) {
                toast.success("Follow-up requested for ticket " + ticket.ticketNumber);
                loadTickets();
            } else {
                toast.error("Failed to trigger follow-up.");
            }
        } catch (_e) {
            toast.error("An error occurred while following up.");
        }
    };

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
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="w-full shadow-sm overflow-hidden border rounded-none">
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Support Tickets</CardTitle>
                        <CardDescription>Manage and track all system support requests</CardDescription>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all hover:shadow-lg">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                New Ticket
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogTitle className="sr-only">Create a Ticket</DialogTitle>
                            <UIDialogDescription className="sr-only">Fill out the form below to create a new ticket.</UIDialogDescription>
                        <TicketForm 
                            onSuccess={() => {
                                setIsCreateOpen(false);
                                loadTickets();
                            }} 
                            onCancel={() => setIsCreateOpen(false)} 
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="pt-2">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Loading tickets...</p>
                    </div>
                ) : (
                    <div className="rounded-none border bg-card/50 shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold w-[120px]">Ticket #</TableHead>
                                    <TableHead className="font-semibold min-w-[200px]">Title</TableHead>
                                    <TableHead className="font-semibold">Category</TableHead>
                                    <TableHead className="font-semibold w-[120px]">Priority</TableHead>
                                    <TableHead className="font-semibold w-[140px]">Status</TableHead>
                                    <TableHead className="text-right font-semibold w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                    <TicketIcon className="w-8 h-8 text-muted-foreground/50" />
                                                </div>
                                                <h3 className="font-semibold text-lg">No tickets found</h3>
                                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                                    There are currently no tickets in the system. Create a new one to get started.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tickets.map((ticket) => (
                                        <TableRow key={ticket.ticketId} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                <span className="font-mono text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {ticket.ticketNumber}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{ticket.title}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500/70"></div>
                                                    {ticket.category?.categoryName || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-medium ${getPriorityColor(ticket.priority)} border-transparent`}>
                                                    {ticket.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`font-semibold ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {ticket.status.toLowerCase() !== 'resolved' && ticket.status.toLowerCase() !== 'closed' && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                                            disabled={!getFollowUpStatus(ticket).canFollowUp}
                                                            onClick={() => handleFollowUp(ticket)}
                                                            title={getFollowUpStatus(ticket).waitText}
                                                        >
                                                            <BellRingIcon className="w-4 h-4 mr-1" />
                                                            {getFollowUpStatus(ticket).canFollowUp ? "Follow Up" : getFollowUpStatus(ticket).waitText}
                                                        </Button>
                                                    )}
                                                    <Link href={`/system-management/ticket/${ticket.ticketId}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <EyeIcon className="w-4 h-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
        </div>
    );
}
