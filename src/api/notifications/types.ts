export type NotificationItem = {
    id: string;
    type: string; // Laravel notification class name
    created_at?: string | null;
    read_at?: string | null;
    data: Record<string, any>;
};
