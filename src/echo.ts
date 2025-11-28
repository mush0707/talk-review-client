import Echo from "laravel-echo";
import Pusher from "pusher-js";
import type { Pinia } from "pinia";
import { useAuthStore } from "@/stores/auth.store";

let echoInstance: Echo<any> | null = null;

function toBool(v: unknown, fallback = false): boolean {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") return ["1", "true", "yes", "on"].includes(v.toLowerCase());
    return fallback;
}

export function initEcho(pinia: Pinia): Echo<any> | null {
    const key = (import.meta.env.VITE_PUSHER_APP_KEY as string | undefined)?.trim();
    const host = (import.meta.env.VITE_PUSHER_HOST as string | undefined)?.trim() || "localhost";
    const port = Number((import.meta.env.VITE_PUSHER_PORT as string | number | undefined) ?? 6001);
    const forceTLS = toBool(import.meta.env.VITE_PUSHER_TLS, false);

    const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

    if (!key) {
        console.warn("[echo] VITE_PUSHER_APP_KEY is empty -> Reverb will reject with 4001");
        return null;
    }

    // Echo uses Pusher protocol underneath
    (window as any).Pusher = Pusher;

    const auth = useAuthStore(pinia);
    const token = auth.token;

    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    echoInstance = new Echo({
        broadcaster: "reverb",
        key,

        wsHost: host,
        wsPort: port,
        wssPort: port,
        forceTLS,
        enabledTransports: ["ws", "wss"],

        authEndpoint: apiBase ? `${apiBase}/broadcasting/auth` : "/broadcasting/auth",
        auth: { headers },
    });

    (window as any).Echo = echoInstance;

    console.log("[Echo created]", {
        key,
        host,
        port,
        forceTLS,
        authEndpoint: apiBase ? `${apiBase}/broadcasting/auth` : "/broadcasting/auth",
    });

    try {
        const conn = (echoInstance.connector as any)?.pusher?.connection;
        conn?.bind("connected", () => console.log("[Echo] connected"));
        conn?.bind("disconnected", () => console.log("[Echo] disconnected"));
        conn?.bind("error", (err: any) => console.error("[Echo] error", err));
    } catch {
        // ignore
    }

    return echoInstance;
}

export function getEcho(): Echo<any> | null {
    return echoInstance;
}
