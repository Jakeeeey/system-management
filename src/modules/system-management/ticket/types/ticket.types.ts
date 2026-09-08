export interface TicketCategory {
  categoryId: number;
  categoryName: string;
  description: string | null;
  isActive: boolean;
}

export interface Ticket {
  ticketId: number;
  ticketNumber: string;
  title: string;
  description: string;
  categoryId: number;
  status: string;
  priority: string;
  createdBy: number;
  assignedTo: number | null;
  assigneeName?: string;
  reporterName: string | null;
  reporterDescription: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[] | null;
  followUpTimestamp: string | null;
  // Optional relations
  category?: TicketCategory;
}

export interface TicketActivity {
  activityId: number;
  ticketId: number;
  userId: number;
  activityType: string;
  oldStatus: string | null;
  newStatus: string | null;
  note: string | null;
  createdAt: string;
}
