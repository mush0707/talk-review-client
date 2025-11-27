import axios from "axios";

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:8080";

export const http = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    timeout: 20_000,
});

http.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

http.interceptors.response.use(
    (r) => r,
    async (err) => {
        if (err?.response?.status === 401) {
            // token invalid -> clear and send to login
            localStorage.removeItem("auth_token");
            // optional: hard redirect to avoid router import cycle
            if (window.location.pathname !== "/login") window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);
