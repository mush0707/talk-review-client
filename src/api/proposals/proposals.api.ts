import { http } from "@/api/http/client";
import type {
    LaravelPaginator,
    Proposal,
    ProposalSearchParams,
    ProposalStatus,
    ProposalSearchHit,
    Review,
    ReviewSearchHit,
    ReviewSearchParams,
    ReviewUpsertPayload,
    ProposalShowResponse,
} from "./types";

function parseFilenameFromContentDisposition(cd?: string): string | null {
    if (!cd) return null;

    // filename*=UTF-8''... OR filename="..." OR filename=...
    const m = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/i.exec(cd);
    const raw = (m?.[1] ?? m?.[2] ?? m?.[3] ?? "").trim();
    if (!raw) return null;

    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

export const proposalsApi = {
    search(params: ProposalSearchParams) {
        return http
            .get<LaravelPaginator<ProposalSearchHit>>("/api/proposals", { params })
            .then((r) => r.data);
    },

    get(id: number) {
        return http.get<ProposalShowResponse>(`/api/proposals/${id}`).then((r) => r.data);
    },

    create(form: FormData) {
        return http
            .post<Proposal>("/api/proposals", form, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((r) => r.data);
    },

    changeStatus(id: number, status: ProposalStatus) {
        return http
            .patch(`/api/proposals/${id}/status`, { status })
            .then((r) => r.data);
    },

    listReviews(proposalId: number, params: ReviewSearchParams) {
        return http
            .get<LaravelPaginator<ReviewSearchHit>>(
                `/api/proposals/${proposalId}/reviews`,
                { params },
            )
            .then((r) => r.data);
    },

    upsertMyReview(proposalId: number, payload: ReviewUpsertPayload) {
        return http
            .put<Review>(`/api/proposals/${proposalId}/reviews/me`, payload)
            .then((r) => r.data);
    },

    async downloadAttachment(proposalId: number): Promise<{ blob: Blob; filename: string | null }> {
        const res = await http.get(`/api/proposals/${proposalId}/attachment`, {
            responseType: "blob",
            // important so unauthenticated becomes JSON 401 instead of HTML redirect
            headers: { Accept: "application/json" },
        });

        const cd = (res.headers?.["content-disposition"] as string | undefined) ?? undefined;
        const filename = parseFilenameFromContentDisposition(cd);

        return { blob: res.data as Blob, filename };
    },
};
