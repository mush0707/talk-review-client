import type { AxiosError } from "axios";

export type ApiError = {
    status?: number;
    message: string;
    errors?: Record<string, string[]>;
};

export function normalizeApiError(err: unknown): ApiError {
    const e = err as AxiosError<any>;
    const status = e?.response?.status;

    const data = e?.response?.data;
    const message =
        data?.message ??
        (typeof data === "string" ? data : null) ??
        e?.message ??
        "Request failed";

    const errors: Record<string, string[]> | undefined =
        data?.errors && typeof data.errors === "object" ? data.errors : undefined;

    return { status, message, errors };
}
