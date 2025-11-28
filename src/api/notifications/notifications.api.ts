import { http } from "@/api/http/client";
import type { NotificationItem } from "./types";

type NotificationsResponse = {
    items: NotificationItem[];
    unread: number;
};

function unwrapBody<T = any>(res: any): T {
    const body = res?.data ?? res;

    if (body && typeof body === "object" && "data" in body) {
        const inner = (body as any).data;
        if (inner && typeof inner === "object" && "items" in inner) return inner as T;
        return inner as T;
    }

    return body as T;
}

export const notificationsApi = {
    async list(params: { limit?: number; search?: string } = {}): Promise<NotificationsResponse> {
        const res = await http.get("/api/notifications", { params });
        const body = unwrapBody<any>(res);

        const items = body?.items ?? [];
        const unread = body?.unread ?? 0;

        return {
            items: Array.isArray(items) ? items : [],
            unread: typeof unread === "number" ? unread : 0,
        };
    },

    async readAll(): Promise<{ ok: boolean }> {
        const res = await http.post("/api/notifications/read-all");
        const body = unwrapBody<any>(res);
        return { ok: Boolean(body?.ok ?? true) };
    },

    // ✅ NEW: unread count endpoint (independent)
    async unreadCount(): Promise<{ unread: number }> {
        const res = await http.get("/api/notifications/unread-count");
        const body = unwrapBody<any>(res);
        const unread = body?.unread ?? 0;
        return { unread: typeof unread === "number" ? unread : 0 };
    },
};
