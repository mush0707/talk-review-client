import { http } from "@/api/http/client";
import type { AuthTokenResponse, LoginPayload, MeResponse, RegisterPayload } from "./types";

export const authApi = {
    register(payload: RegisterPayload) {
        return http.post<AuthTokenResponse>("/api/auth/register", payload).then((r) => r.data);
    },
    login(payload: LoginPayload) {
        return http.post<AuthTokenResponse>("/api/auth/login", payload).then((r) => r.data);
    },
    me() {
        return http.get<MeResponse>("/api/auth/me").then((r) => r.data);
    },
    logout() {
        return http.post<{ ok: boolean }>("/api/auth/logout").then((r) => r.data);
    },
    resendVerification() {
        return http
            .post<{ ok: boolean }>("/api/auth/email/verification-notification")
            .then((r) => r.data);
    },
};
