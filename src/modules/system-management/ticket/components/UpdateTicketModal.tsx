"use client"

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Ticket } from "../types/ticket.types";
import { AccountRepo } from "../../account-management/services/account.repo";
import { AccountUser } from "../../account-management/types/account.types";
import { updateTicketWithActivity } from "@/actions/ticket.action";
import { toast } from "sonner";

const formSchema = z.object({
    status: z.string().min(1, "Please select a status"),
    assignedTo: z.number().nullable().optional(),
    note: z.string().optional(),
});

type UpdateTicketFormValues = z.infer<typeof formSchema>;

export function UpdateTicketModal({ 
    ticket, 
    isOpen, 
    onClose, 
    onSuccess 
}: { 
    ticket: Ticket, 
    isOpen: boolean, 
    onClose: () => void,
    onSuccess: () => void 
}) {
    const [users, setUsers] = useState<AccountUser[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<UpdateTicketFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: ticket.status,
            assignedTo: ticket.assignedTo || undefined,
            note: "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            AccountRepo.getUsers().then(setUsers);
            form.reset({
                status: ticket.status,
                assignedTo: ticket.assignedTo || undefined,
                note: "",
            });
        }
    }, [isOpen, ticket, form]);

    const onSubmit = async (values: UpdateTicketFormValues) => {
        setLoading(true);
        try {
            const success = await updateTicketWithActivity(
                ticket.ticketId, 
                {
                    status: values.status,
                    assignedTo: values.assignedTo,
                    note: values.note
                }, 
                ticket.status
            );

            if (success) {
                toast.success("Ticket updated successfully");
                onSuccess();
                onClose();
            } else {
                toast.error("Failed to update ticket");
            }
        } catch (error) {
            console.error("Error updating ticket", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-none">
                <DialogHeader>
                    <DialogTitle>Update Ticket</DialogTitle>
                    <DialogDescription>
                        Modify the ticket status, assignee, or add a note to the timeline.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-none">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Open">Open</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                            <SelectItem value="Pending Close">Pending Close</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="assignedTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign To (Optional)</FormLabel>
                                    <Select 
                                        onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} 
                                        defaultValue={field.value ? String(field.value) : undefined}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="rounded-none">
                                                <SelectValue placeholder="Unassigned" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={String(u.id)}>
                                                    {u.fullName || u.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="note"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Activity Note (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="e.g. Investigating the issue..." 
                                            className="min-h-[80px] resize-y rounded-none" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="rounded-none">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="rounded-none">
                                {loading ? "Saving..." : "Save Updates"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
