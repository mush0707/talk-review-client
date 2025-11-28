import { defineStore } from "pinia";
import { notificationsApi } from "@/api/notifications/notifications.api";
import type { NotificationItem } from "@/api/notifications/types";
import { useAuthStore } from "@/stores/auth.store";
import { getEcho } from "@/echo";

type State = {
    items: NotificationItem[];
    unread: number;
    loading: boolean;
    error: string | null;
    subscribedChannel: string | null;
};

export const useNotificationsStore = defineStore("notifications", {
    state: (): State => ({
        items: [],
        unread: 0,
        loading: false,
        error: null,
        subscribedChannel: null,
    }),

    actions: {
        // ✅ NEW: refresh only unread count
        async refreshUnread() {
            try {
                const res = await notificationsApi.unreadCount();
                this.unread = typeof res.unread === "number" ? res.unread : 0;
            } catch {
                // do not wipe badge on error
            }
        },

        async fetchLatest(params: { limit?: number; search?: string } = {}) {
            this.loading = true;
            this.error = null;

            try {
                const res = await notificationsApi.list(params);
                this.items = Array.isArray(res.items) ? res.items : [];
                this.unread = typeof res.unread === "number" ? res.unread : 0;
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || "Failed to load notifications";
                this.error = msg;
                this.items = [];
            } finally {
                this.loading = false;
            }
        },

        /**
         * Call this AFTER initEcho().
         */
        connectIfConfigured(echoInstance?: any) {
            const auth = useAuthStore();
            const userId = auth.user?.id ? Number(auth.user.id) : null;
            if (!userId) return;

            const EchoAny = echoInstance ?? getEcho() ?? (window as any)?.Echo;
            if (!EchoAny) {
                console.warn("[notifications] Echo is undefined (initEcho not called yet)");
                return;
            }

            const channel = `App.Models.User.${userId}`;
            if (this.subscribedChannel === channel) return;

            // best-effort cleanup
            if (this.subscribedChannel) {
                try {
                    EchoAny.leave(`private-${this.subscribedChannel}`);
                } catch {
                    // ignore
                }
            }

            this.subscribedChannel = channel;

            console.log("[notifications] subscribing to", channel);

            EchoAny.private(channel).notification((payload: any) => {
                const id = payload?.id ?? (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()));
                console.log(payload);

                this.pushIncoming({
                    id: String(id),
                    type: String(payload?.type ?? "notification"),
                    created_at: new Date().toISOString(),
                    read_at: null,
                    data: payload ?? {},
                });

                // ✅ ensure badge stays accurate (server truth)
                this.refreshUnread();
            });
        },

        async readAllRemote() {
            this.error = null;

            try {
                await notificationsApi.readAll();
                this.unread = 0;

                const nowIso = new Date().toISOString();
                this.items = this.items.map((x) => ({
                    ...x,
                    read_at: x.read_at ?? nowIso,
                }));

                // ✅ server truth (in case backend logic differs)
                this.refreshUnread();
            } catch (e: any) {
                const msg = e?.response?.data?.message || e?.message || "Failed to mark notifications as read";
                this.error = msg;
            }
        },

        pushIncoming(item: NotificationItem) {
            if (!item?.id) return;
            if (this.items.some((x) => x.id === item.id)) return;

            this.items = [item, ...this.items].slice(0, 100);
            if (!item.read_at) this.unread = (this.unread ?? 0) + 1;
        },
    },
});
