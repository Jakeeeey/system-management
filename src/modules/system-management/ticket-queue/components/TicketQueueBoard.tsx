"use client"

import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchTickets, fetchTicketCategories } from "@/actions/ticket.action";
import { Ticket, TicketCategory } from "../../ticket/types/ticket.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, HashIcon, AlertCircleIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function TicketQueueBoard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [categories, setCategories] = useState<TicketCategory[]>([]);
    const [lastTicketId, setLastTicketId] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [followUpAlert, setFollowUpAlert] = useState<Ticket | null>(null);
    
    // Store the last known follow up timestamps for each ticket to detect changes
    const knownFollowUpsRef = useRef<Record<number, string | null>>({});
    const audioCtxRef = useRef<AudioContext | null>(null);

    const playNotificationSound = useCallback((priority: string = 'Normal') => {
        if (!soundEnabled) return;

        const isHighPriority = priority.toLowerCase() === 'high' || priority.toLowerCase() === 'critical';

        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            if (isHighPriority) {
                // Extremely attentive wailing siren for High/Critical tickets
                const playSiren = (startTime: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = 'sawtooth';
                    
                    // Wailing siren effect (sweeps up and down rapidly)
                    for (let i = 0; i < 10; i++) {
                        const time = startTime + (i * 0.3);
                        osc.frequency.setValueAtTime(600, time);
                        osc.frequency.linearRampToValueAtTime(1500, time + 0.15);
                        osc.frequency.linearRampToValueAtTime(600, time + 0.3);
                    }
                    
                    // Volume envelope
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
                    gain.gain.setValueAtTime(0.3, startTime + 2.9);
                    gain.gain.linearRampToValueAtTime(0, startTime + 3.0);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(startTime);
                    osc.stop(startTime + 3.0);
                };

                playSiren(ctx.currentTime);
            } else {
                // The previous alarm sequence is now used for Low/Medium tickets
                const playBeep = (startTime: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    
                    osc.type = 'square';
                    // Alternating frequencies for an alarm-like effect
                    osc.frequency.setValueAtTime(800, startTime);
                    osc.frequency.setValueAtTime(1200, startTime + 0.2);
                    osc.frequency.setValueAtTime(800, startTime + 0.4);
                    osc.frequency.setValueAtTime(1200, startTime + 0.6);
                    
                    // Volume envelope
                    gain.gain.setValueAtTime(0, startTime);
                    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
                    gain.gain.setValueAtTime(0.2, startTime + 0.75);
                    gain.gain.linearRampToValueAtTime(0, startTime + 0.8);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    
                    osc.start(startTime);
                    osc.stop(startTime + 0.8);
                };

                // Play the alarm 3 times spanning over 3 seconds
                playBeep(ctx.currentTime);
                playBeep(ctx.currentTime + 1.0);
                playBeep(ctx.currentTime + 2.0);
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }, [soundEnabled]);

    const loadData = useCallback(async (isInitial = false) => {
        try {
            const [fetchedTickets, fetchedCats] = await Promise.all([
                fetchTickets(),
                fetchTicketCategories()
            ]);

            setCategories(fetchedCats);

            // Only show active tickets on the board
            const activeTickets = fetchedTickets.filter(t => 
                t.status.toLowerCase() !== 'resolved' && 
                t.status.toLowerCase() !== 'closed'
            );

            // Find the highest ticket ID
            let maxId = 0;
            let newTicketPriority = 'Normal';
            if (fetchedTickets.length > 0) {
                const highestTicket = fetchedTickets.reduce((prev, current) => (Number(prev.ticketId) > Number(current.ticketId)) ? prev : current);
                maxId = Number(highestTicket.ticketId);
                newTicketPriority = highestTicket.priority;
            }

            setTickets(activeTickets);

            if (isInitial) {
                setLastTicketId(maxId);
                
                // Initialize known follow ups to avoid firing on first load
                const initialMap: Record<number, string | null> = {};
                for (const ticket of activeTickets) {
                    initialMap[ticket.ticketId] = ticket.followUpTimestamp;
                }
                knownFollowUpsRef.current = initialMap;
            } else {
                // Check for new tickets
                if (maxId > lastTicketId) {
                    playNotificationSound(newTicketPriority);
                    setLastTicketId(maxId);
                }

                // Check for new follow-ups by comparing strings exactly
                let newFollowUp: Ticket | null = null;
                const newKnownMap = { ...knownFollowUpsRef.current };

                for (const ticket of activeTickets) {
                    const previousTimestamp = newKnownMap[ticket.ticketId];
                    const currentTimestamp = ticket.followUpTimestamp;
                    
                    // If it has a timestamp, and it's DIFFERENT from what we knew before
                    if (currentTimestamp && currentTimestamp !== previousTimestamp) {
                        newFollowUp = ticket;
                    }
                    newKnownMap[ticket.ticketId] = currentTimestamp || null;
                }
                
                knownFollowUpsRef.current = newKnownMap;

                if (newFollowUp) {
                    setFollowUpAlert(newFollowUp);
                    playNotificationSound('Critical'); // Force siren sound
                    
                    // Auto-dismiss the dialog after 10 seconds
                    setTimeout(() => {
                        setFollowUpAlert(current => current?.ticketId === newFollowUp?.ticketId ? null : current);
                    }, 10000);
                }
            }
        } catch (error) {
            console.error("Error polling tickets:", error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [lastTicketId, playNotificationSound]);

    useEffect(() => {
        loadData(true);
        const interval = setInterval(() => {
            loadData(false);
        }, 5000);

        return () => clearInterval(interval);
    }, [loadData]);

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        if (!soundEnabled) {
            // Play a test sound to initialize audio context
            setTimeout(playNotificationSound, 100);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-xl font-semibold">Initializing Queue Monitor...</h2>
                </div>
            </div>
        );
    }

    // Group tickets by category
    const groupedTickets = categories.map(cat => ({
        category: cat,
        tickets: tickets.filter(t => t.category?.categoryId === cat.categoryId)
    })).filter(g => g.category.isActive); // only show active categories

    // Add uncategorized
    const uncategorized = tickets.filter(t => !t.category);
    if (uncategorized.length > 0) {
        groupedTickets.push({
            category: { categoryId: 0, categoryName: 'Uncategorized', description: '', isActive: true },
            tickets: uncategorized
        });
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background text-foreground animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b bg-card">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight uppercase text-primary">Live Ticket Queue</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Monitoring new and active requests</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold text-lg uppercase tracking-widest text-emerald-600">Live</span>
                    </div>
                    
                    <Button 
                        variant={soundEnabled ? "default" : "outline"} 
                        size="lg" 
                        onClick={toggleSound}
                        className="rounded-none font-bold uppercase tracking-wider"
                    >
                        {soundEnabled ? <Volume2Icon className="mr-2 w-5 h-5" /> : <VolumeXIcon className="mr-2 w-5 h-5" />}
                        {soundEnabled ? "Sound ON" : "Sound OFF"}
                    </Button>
                </div>
            </header>

            {/* Board */}
            <main className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                {!soundEnabled && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-none flex items-center gap-4 text-amber-700 dark:text-amber-400">
                        <AlertCircleIcon className="w-6 h-6 shrink-0" />
                        <p className="font-medium text-lg">Sound notifications are currently disabled. Click the "Sound OFF" button to enable audio alerts for new tickets.</p>
                    </div>
                )}
                
                <div className="flex h-full gap-6 w-max min-w-full pb-4">
                    {groupedTickets.map((group) => (
                        <div key={group.category.categoryId} className="flex flex-col w-[450px] shrink-0 border-2 bg-muted/20 border-border/50 rounded-none overflow-hidden h-full">
                            <div className="bg-muted p-4 border-b-2 flex items-center justify-between">
                                <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">{group.category.categoryName}</h2>
                                <Badge variant="secondary" className="text-xl px-3 py-1 font-mono rounded-none">
                                    {group.tickets.length}
                                </Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {group.tickets.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground/50 italic text-xl">
                                        No active tickets
                                    </div>
                                ) : (
                                    group.tickets.map((ticket) => (
                                        <Card key={ticket.ticketId} className="rounded-none shadow-md border-l-4 border-l-primary hover:border-l-indigo-500 transition-colors bg-card animate-in slide-in-from-left-4 duration-500">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2 font-mono text-lg font-bold text-muted-foreground">
                                                        <HashIcon className="w-5 h-5" />
                                                        {ticket.ticketNumber}
                                                    </div>
                                                    <Badge 
                                                        variant={ticket.priority.toLowerCase() === 'critical' ? 'destructive' : 'secondary'}
                                                        className="text-sm rounded-none uppercase font-bold tracking-wider px-2 py-1"
                                                    >
                                                        {ticket.priority}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-xl font-bold leading-tight mb-4">{ticket.title}</h3>
                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                        <ClockIcon className="w-4 h-4" />
                                                        {new Date(ticket.createdAt).toLocaleTimeString('en-US', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="font-semibold px-3 py-1 bg-primary/10 text-primary uppercase text-sm">
                                                        {ticket.status}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Follow-up Alert Dialog */}
            <Dialog open={!!followUpAlert} onOpenChange={(open) => !open && setFollowUpAlert(null)}>
                <DialogContent className="rounded-none border-red-500 border-4 sm:max-w-lg bg-red-50 dark:bg-red-950 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-red-700 dark:text-red-400 uppercase text-3xl font-black flex items-center gap-3">
                            <AlertCircleIcon className="w-10 h-10 animate-pulse" />
                            Follow-Up Requested!
                        </DialogTitle>
                        <DialogDescription className="text-red-800 dark:text-red-300 text-lg mt-4 font-medium text-left">
                            A follow-up was just requested by a user for ticket <strong className="font-mono">{followUpAlert?.ticketNumber}</strong>.
                            <br/><br/>
                            <span className="text-2xl font-bold text-red-900 dark:text-red-200">{followUpAlert?.title}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button 
                            variant="destructive" 
                            className="rounded-none font-bold uppercase w-full text-lg h-12"
                            onClick={() => setFollowUpAlert(null)}
                        >
                            Acknowledge
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
