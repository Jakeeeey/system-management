"use client"

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTicketCategories, addTicket, uploadTicketImages } from "../actions/ticket.action";
import { TicketCategory } from "../types/ticket.types";
import { AccountRepo } from "../../account-management/services/account.repo";
import { AccountUser } from "../../account-management/types/account.types";
import { toast } from "sonner";

const formSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    categoryId: z.number().min(1, "Please select a category"),
    priority: z.string().min(1, "Please select a priority"),
    status: z.string().min(1, "Please select a status"),
    assignedTo: z.number().optional(),
    reporterName: z.string().optional(),
    reporterDescription: z.string().optional(),
});

type TicketFormValues = z.infer<typeof formSchema>;

export function TicketForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
    const router = useRouter();
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [users, setUsers] = useState<AccountUser[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<TicketFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            categoryId: 0,
            priority: "Medium",
            status: "Open",
            assignedTo: undefined,
            reporterName: "",
            reporterDescription: "",
        },
    });

    useEffect(() => {
        const loadData = async () => {
            const [catData, userData] = await Promise.all([
                fetchTicketCategories(),
                AccountRepo.getUsers()
            ]);
            setCategories(catData);
            setUsers(userData);
        };
        loadData();
    }, []);

    useEffect(() => {
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setFilePreviews(newPreviews);
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files]);

    const onSubmit = async (values: TicketFormValues) => {
        setLoading(true);
        try {
            // Upload images first if any
            let imageIds: string[] = [];
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(file => formData.append('files', file));
                imageIds = await uploadTicketImages(formData);
            }

            // Use the first available user ID as the creator since we don't have auth context yet,
            // or fallback to 24 which we know exists from the logs
            const defaultUserId = users.length > 0 ? users[0].id : 24;
            
            const success = await addTicket({
                ...values,
                createdBy: defaultUserId, 
                images: imageIds.length > 0 ? imageIds : null,
                status: values.status || "Open"
            });
            if (success) {
                toast.success("Ticket created successfully");
                router.refresh();
                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/system-management/ticket");
                }
            } else {
                toast.error("Failed to create ticket");
            }
        } catch (error) {
            console.error("Error submitting ticket form", error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-none shadow-none rounded-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Ticket Creation</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Basic Details</h3>
                            <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ticket title" className="rounded-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value ? String(field.value) : undefined}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-none">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>
                                                        {cat.categoryName}
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
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="rounded-none">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                                <SelectItem value="Critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                                <SelectItem value="Closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Additional Information</h3>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Detailed description of the issue or request" className="min-h-[120px] resize-y bg-muted/20 focus-visible:bg-transparent transition-colors rounded-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <div className="grid grid-cols-1 gap-4">
                                <FormItem>
                                    <FormLabel>Attachments (Images)</FormLabel>
                                    <FormControl>
                                        <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-none p-8 text-center hover:bg-muted/10 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 flex flex-col items-center justify-center min-h-[120px]">
                                            <Input 
                                                type="file" 
                                                accept="image/*" 
                                                multiple 
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => setFiles(Array.from(e.target.files || []))} 
                                            />
                                            {files.length === 0 ? (
                                                <div className="pointer-events-none flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center text-primary mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                                                    </div>
                                                    <p className="text-sm font-medium">Click or drag images to upload</p>
                                                    <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 10MB</p>
                                                </div>
                                            ) : (
                                                <div className="pointer-events-none flex flex-col w-full h-full items-center justify-center gap-4">
                                                    <div className="flex flex-wrap gap-2 justify-center">
                                                        {filePreviews.map((src, i) => (
                                                            <div key={i} className="relative w-16 h-16 border rounded-none overflow-hidden bg-background shadow-sm">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <p className="text-sm font-medium text-emerald-600">{files.length} image(s) selected</p>
                                                        <p className="text-xs text-muted-foreground">Click to select different files</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Assignment & Reporter</h3>
                            <FormField
                            control={form.control}
                            name="assignedTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assign To (Optional)</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(val === "none" ? undefined : Number(val))} defaultValue={field.value ? String(field.value) : undefined}>
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reporterName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reporter Name (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" className="rounded-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="reporterDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reporter Details (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Department, Role, etc." className="rounded-none" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                            <Button type="button" variant="outline" className="rounded-none" onClick={() => {
                                if (onCancel) onCancel();
                                else router.back();
                            }}>Cancel</Button>
                            <Button type="submit" className="rounded-none" disabled={loading}>
                                {loading ? "Creating..." : "Create Ticket"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
