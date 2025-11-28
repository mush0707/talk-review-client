import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
    interface Window {
        Pusher?: typeof Pusher;
    }
}

export type EchoConfig = {
    broadcaster: "pusher";

    // Reverb uses Pusher protocol, so key is required
    key: string;

    wsHost: string;
    wsPort: number;

    forceTLS: boolean;
    enabledTransports: ("ws" | "wss")[];

    // IMPORTANT for private channels
    authEndpoint: string;
    authHeader?: string | null; // "Bearer <token>"
};

export function buildEcho(cfg: EchoConfig) {
    window.Pusher = Pusher;

    return new Echo({
        broadcaster: "pusher",
        key: cfg.key,

        wsHost: cfg.wsHost,
        wsPort: cfg.wsPort,
        wssPort: cfg.wsPort,

        forceTLS: cfg.forceTLS,
        enabledTransports: cfg.enabledTransports,

        authEndpoint: cfg.authEndpoint,
        auth: {
            headers: cfg.authHeader ? { Authorization: cfg.authHeader } : {},
        },
    });
}
