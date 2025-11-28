export type ProposalStatus = "pending" | "approved" | "rejected";

export type Proposal = {
    id: number;
    speaker_id: number;
    title: string;
    description: string;
    status: ProposalStatus;
    attachment_path?: string | null;
    tag_names?: string[];
    reviews_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type TemporaryDownloadLink = {
    url: string;
    expires_at: string;
};

export type ProposalShowResponse = {
    proposal: Proposal;
    attachment: TemporaryDownloadLink | null;
};

export type ProposalSearchHit = {
    model: Proposal;
    index_name: string;
    document: {
        id: string;
        content: {
            id: number;
            title: string;
            description: string;
            status: ProposalStatus;
            speaker_id: number;
            tag_ids: number[];
            tag_names: string[];
            created_at: string;
        };
    };
    highlight: unknown | null;
    score: number | null;
};

export type LaravelPaginator<T> = {
    current_page: number;
    data: T[];
    first_page_url?: string;
    from?: number | null;
    last_page: number;
    last_page_url?: string;
    next_page_url?: string | null;
    path: string;
    per_page: number;
    prev_page_url?: string | null;
    to?: number | null;
    total: number;
};

export type ProposalSearchParams = {
    search?: string;
    status?: ProposalStatus;
    tag_ids?: number[];
    page?: number;
    per_page?: number;
};

// ---- reviews ----

export type Review = {
    id: number;
    proposal_id: number;
    reviewer_id: number;
    rating: number;
    comment: string | null;
    created_at?: string;
    updated_at?: string;
};

export type ReviewSearchHit = {
    model: Review;
    index_name: string;
    document: {
        id: string;
        content: {
            id: number;
            proposal_id: number;
            reviewer_id: number;
            rating: number;
            comment: string | null;
            created_at: string;
        };
    };
    highlight: unknown | null;
    score: number | null;
};

export type ReviewSearchParams = {
    search?: string;
    rating_min?: number;
    rating_max?: number;
    page?: number;
    per_page?: number;
};

export type ReviewUpsertPayload = {
    rating: number;
    comment?: string | null;
};
