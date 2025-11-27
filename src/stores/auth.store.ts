import { defineStore } from "pinia";
import { authApi } from "@/api/auth/auth.api";
import type { AuthUser, RegisterPayload } from "@/api/auth/types";
import { normalizeApiError, type ApiError } from "@/api/http/error";

type AuthState = {
    token: string | null;
    user: AuthUser | null;
    mustVerifyEmail: boolean;
    emailVerified: boolean;
    bootstrapped: boolean;
    loading: boolean;
    lastError: ApiError | null;
};

export const useAuthStore = defineStore("auth", {
    state: (): AuthState => ({
        token: localStorage.getItem("auth_token"),
        user: null,
        mustVerifyEmail: true,
        emailVerified: false,
        bootstrapped: false,
        loading: false,
        lastError: null,
    }),

    getters: {
        isLoggedIn: (s) => !!s.token,
        needsEmailVerification: (s) => s.mustVerifyEmail && !s.emailVerified,
    },

    actions: {
        setAuth(payload: { token: string; user: AuthUser; must_verify_email: boolean; email_verified: boolean }) {
            this.token = payload.token;
            this.user = payload.user;
            this.mustVerifyEmail = payload.must_verify_email;
            this.emailVerified = payload.email_verified;
            localStorage.setItem("auth_token", payload.token);
        },

        clearAuth() {
            this.token = null;
            this.user = null;
            this.mustVerifyEmail = true;
            this.emailVerified = false;
            localStorage.removeItem("auth_token");
        },

        async bootstrap() {
            if (this.bootstrapped) return;
            this.bootstrapped = true;

            if (!this.token) return;

            try {
                this.loading = true;
                const me = await authApi.me();
                this.user = me.user;
                this.mustVerifyEmail = me.must_verify_email;
                this.emailVerified = me.email_verified;
            } catch (e) {
                // token invalid / expired
                this.clearAuth();
            } finally {
                this.loading = false;
            }
        },

        async login(email: string, password: string) {
            this.lastError = null;
            this.loading = true;
            try {
                const r = await authApi.login({ provider: "local", email, password });
                this.setAuth(r);
            } catch (e) {
                this.lastError = normalizeApiError(e);
                throw this.lastError;
            } finally {
                this.loading = false;
            }
        },

        async register(payload: Omit<RegisterPayload, "provider">) {
            this.lastError = null;
            this.loading = true;
            try {
                const r = await authApi.register({ provider: "local", ...payload });
                this.setAuth(r);
            } catch (e) {
                this.lastError = normalizeApiError(e);
                throw this.lastError;
            } finally {
                this.loading = false;
            }
        },

        async resendVerification() {
            this.lastError = null;
            try {
                await authApi.resendVerification();
            } catch (e) {
                this.lastError = normalizeApiError(e);
                throw this.lastError;
            }
        },

        async logout() {
            this.lastError = null;
            try {
                if (this.token) await authApi.logout();
            } finally {
                this.clearAuth();
            }
        },
    },
});
