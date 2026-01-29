export interface TicketUpdatePayload {
  type: "ticket_updated" | "message_added";
  ticketId: string;
  data?: unknown;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface TicketListUpdatePayload {
  type: "ticket_created" | "ticket_deleted" | "ticket_updated";
  ticketId?: string;
}

export interface ServerToClientEvents {
  "ticket:update": (data: TicketUpdatePayload) => void;
  "tickets:list_update": (data: TicketListUpdatePayload) => void;
  notification: (data: NotificationPayload) => void;
  "notification:new": (data: NotificationPayload) => void;
}

export interface ClientToServerEvents {
  "join-ticket": (ticketId: string) => void;
  "leave-ticket": (ticketId: string) => void;
}
