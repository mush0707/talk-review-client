import { http } from "@/api/http/client";
import type { Tag } from "./types";

export const tagsApi = {
    list(params: { search?: string; limit?: number } = {}) {
        return http.get<Tag[]>("/api/tags", { params }).then((r) => r.data);
    },
};