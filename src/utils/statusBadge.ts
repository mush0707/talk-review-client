export type ProposalStatus = "pending" | "approved" | "rejected";

export function statusBadgeClass(s: ProposalStatus): string {
    if (s === "approved") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
    if (s === "rejected") return "border-rose-400/30 bg-rose-400/10 text-rose-100";
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
}