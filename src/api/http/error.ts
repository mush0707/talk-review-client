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
    const baseMessage =
        data?.message ??
        (typeof data === "string" ? data : null) ??
        e?.message ??
        "Request failed";

    const errors: Record<string, string[]> | undefined =
        data?.errors && typeof data.errors === "object" ? (data.errors as Record<string, string[]>) : undefined;

    if (errors) {
        const keys = Object.keys(errors);
        const firstKey = keys.length ? keys[0] : null;
        const firstMsg = firstKey ? errors[firstKey]?.[0] : null;

        return {
            status,
            message: firstMsg ? `${baseMessage}: ${firstMsg}` : baseMessage,
            errors,
        };
    }

    return { status, message: baseMessage, errors };
}
