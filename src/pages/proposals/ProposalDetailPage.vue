<!-- src/pages/proposals/ProposalDetailPage.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { normalizeApiError } from "@/api/http/error";
import AppShell from "@/components/ui/AppShell.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import AlertBox from "@/components/ui/AlertBox.vue";
import TextField from "@/components/ui/TextField.vue";
import VerifyEmailInfoCard from "@/pages/auth/VerifyEmailInfoCard.vue";

import { useAuthStore } from "@/stores/auth.store";
import { proposalsApi } from "@/api/proposals/proposals.api";
import type { LaravelPaginator, Proposal, ProposalStatus, ReviewSearchHit } from "@/api/proposals/types";
import ProposalStatusBadge from "@/components/ui/ProposalStatusBadge.vue";

type TemporaryDownloadLink = {
  url: string;
  expires_at: string;
};

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const id = Number(route.params.id);

const loading = ref(false);
const errorMsg = ref<string | null>(null);
const proposal = ref<Proposal | null>(null);
const attachment = ref<TemporaryDownloadLink | null>(null);

const isAdmin = computed(() => auth.user?.role === "admin");
const isReviewer = computed(() => auth.user?.role === "reviewer");

const statusDraft = ref<ProposalStatus>("pending");
const statusSaving = ref(false);
const statusMsg = ref<string | null>(null);

// reviewer form (stars)
const rating = ref<number | null>(null);
const hoverRating = ref<number | null>(null);
const comment = ref("");
const savingReview = ref(false);
const reviewMsg = ref<string | null>(null);
const reviewErr = ref<string | null>(null);

const stars = [1, 2, 3, 4, 5] as const;
const effectiveRating = computed(() => hoverRating.value ?? rating.value ?? 0);
const canSaveReview = computed(() => isReviewer.value && !savingReview.value && rating.value !== null);

// reviews list search/pagination
const rSearch = ref("");
const rMin = ref<number | null>(null);
const rMax = ref<number | null>(null);
const rPage = ref(1);
const rPerPage = ref(10);
const rLoading = ref(false);
const rPager = ref<LaravelPaginator<ReviewSearchHit> | null>(null);
const rError = ref<string | null>(null);

const hasPrev = computed(() => !!rPager.value?.prev_page_url && (rPager.value?.current_page ?? 1) > 1);
const hasNext = computed(
    () => !!rPager.value?.next_page_url && (rPager.value?.current_page ?? 1) < (rPager.value?.last_page ?? 1)
);

// IMPORTANT: use signed URL returned from backend (do NOT re-request /attachment)
const attachmentUrl = computed(() => attachment.value?.url ?? null);
const hasAttachment = computed(() => !!attachmentUrl.value);

async function loadProposal() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const res: any = await proposalsApi.get(id);

    proposal.value = res?.proposal ?? null;
    attachment.value = res?.attachment ?? null;

    if (proposal.value) {
      statusDraft.value = (proposal.value.status ?? "pending") as ProposalStatus;
    }
  } catch (e: any) {
    errorMsg.value = normalizeApiError(e).message ?? t("common.error");
  } finally {
    loading.value = false;
  }
}

function finiteOrUndef(v: number | null): number | undefined {
  if (v === null) return undefined;
  return Number.isFinite(v) ? v : undefined;
}

async function loadReviews() {
  rLoading.value = true;
  rError.value = null;

  try {
    rPager.value = await proposalsApi.listReviews(id, {
      search: rSearch.value.trim() || undefined,
      rating_min: finiteOrUndef(rMin.value),
      rating_max: finiteOrUndef(rMax.value),
      page: rPage.value,
      per_page: rPerPage.value,
    });
  } catch (e: any) {
    const err = normalizeApiError(e);
    rError.value = err.message;
    rPager.value = null; // clear list on error
  } finally {
    rLoading.value = false;
  }
}

function openAttachment() {
  if (!attachmentUrl.value) return;
  window.open(attachmentUrl.value, "_blank", "noopener,noreferrer");
}

onMounted(async () => {
  await auth.bootstrap();

  // IMPORTANT: no backend calls until verified
  if (auth.needsEmailVerification) return;

  await loadProposal();
  await loadReviews();
});

watch([rSearch, rMin, rMax], async () => {
  rPage.value = 1;
  if (auth.needsEmailVerification) return;
  await loadReviews();
});

async function saveStatus() {
  if (!proposal.value) return;
  statusMsg.value = null;
  statusSaving.value = true;
  try {
    await proposalsApi.changeStatus(proposal.value.id, statusDraft.value);
    statusMsg.value = t("proposals.statusSaved");
    await loadProposal();
  } catch (e: any) {
    statusMsg.value = normalizeApiError(e).message ?? t("common.error");
  } finally {
    statusSaving.value = false;
  }
}

async function saveMyReview() {
  reviewMsg.value = null;
  reviewErr.value = null;

  if (rating.value === null) {
    reviewErr.value = t("reviews.selectRating");
    return;
  }

  savingReview.value = true;
  try {
    await proposalsApi.upsertMyReview(id, { rating: rating.value, comment: comment.value || null });
    reviewMsg.value = t("reviews.saved");

    rating.value = null;
    hoverRating.value = null;
    comment.value = "";

    await loadReviews();
  } catch (e: any) {
    reviewErr.value = normalizeApiError(e).message ?? t("common.error");
  } finally {
    savingReview.value = false;
  }
}

async function gotoPrev() {
  if (!hasPrev.value) return;
  rPage.value -= 1;
  await loadReviews();
}

async function gotoNext() {
  if (!hasNext.value) return;
  rPage.value += 1;
  await loadReviews();
}
</script>

<template>
  <AppShell :title="proposal?.title ?? t('proposals.detailTitle')" :subtitle="proposal ? t('status.' + proposal.status) : ''">
    <template #top-right>
      <button
          type="button"
          class="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
          @click="router.push('/proposals')"
      >
        {{ t("common.back") }}
      </button>
    </template>

    <!-- IMPORTANT: hide ALL content until verified -->
    <div v-if="auth.needsEmailVerification" class="space-y-4">
      <VerifyEmailInfoCard />
    </div>

    <template v-else>
      <p v-if="errorMsg" class="mb-4 text-sm text-rose-200">{{ errorMsg }}</p>
      <div v-if="loading" class="text-sm text-white/60">{{ t("common.loading") }}</div>

      <div v-else-if="proposal" class="space-y-6">
        <!-- TOP -->
        <div class="grid gap-6 lg:grid-cols-5">
          <!-- left -->
          <div class="lg:col-span-3 space-y-6">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-lg font-semibold text-white">{{ proposal.title }}</p>
                  <p class="mt-1 text-xs text-white/60">
                    {{ proposal.created_at ? new Date(proposal.created_at).toLocaleString() : "" }}
                  </p>
                </div>
                <ProposalStatusBadge :status="proposal.status" :label="t(`status.${proposal.status}`)" />
              </div>

              <p class="mt-4 whitespace-pre-wrap text-sm text-white/80">{{ proposal.description }}</p>

              <div class="mt-4 flex flex-wrap gap-2">
                <span
                    v-for="(name, idx) in (proposal.tag_names ?? [])"
                    :key="name + idx"
                    class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                >
                  {{ name }}
                </span>
              </div>

              <div v-if="hasAttachment" class="mt-6">
                <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
                    @click="openAttachment"
                >
                  {{ t("proposals.openPdf") }}
                </button>
              </div>

              <div v-if="isAdmin">
                <div>
                  <select
                      v-model="statusDraft"
                      class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                  >
                    <option class="bg-slate-950 text-white" value="pending">{{ t("status.pending") }}</option>
                    <option class="bg-slate-950 text-white" value="approved">{{ t("status.approved") }}</option>
                    <option class="bg-slate-950 text-white" value="rejected">{{ t("status.rejected") }}</option>
                  </select>
                </div>

                <div class="mt-4 flex justify-end">
                  <PrimaryButton :disabled="statusSaving" :full="false" @click="saveStatus">
                    {{ statusSaving ? t("common.loading") : t("common.save") }}
                  </PrimaryButton>
                </div>

                <AlertBox v-if="statusMsg" class="mt-3" tone="info" :message="statusMsg" />
              </div>
            </div>
          </div>

          <!-- right -->
          <div class="lg:col-span-2 space-y-6">
            <div
                v-if="isReviewer"
                class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl"
            >
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold text-white">{{ t("reviews.yourReview") }}</p>
              </div>

              <div class="mt-4 space-y-4">
                <div>
                  <label class="text-xs font-medium text-white/70">{{ t("reviews.rating") }}</label>

                  <div class="mt-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-1">
                        <button
                            v-for="s in stars"
                            :key="s"
                            type="button"
                            class="grid h-9 w-9 place-items-center rounded-xl border transition"
                            :disabled="!isReviewer || savingReview"
                            @mouseenter="hoverRating = s"
                            @mouseleave="hoverRating = null"
                            @click="rating = (rating === s ? null : s)"
                            :class="
                            effectiveRating >= s
                              ? 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                              : 'border-white/10 bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                          "
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
                            <path
                                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                            />
                          </svg>
                        </button>
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="text-xs text-white/60">
                          {{ rating === null ? "—" : `${rating}/5` }}
                        </span>

                        <button
                            v-if="rating !== null"
                            type="button"
                            class="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
                            :disabled="!isReviewer || savingReview"
                            @click="rating = null"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="text-xs font-medium text-white/70">
                    {{ t("reviews.comment") }} ({{ t("common.optional") }})
                  </label>

                  <textarea
                      v-model="comment"
                      rows="4"
                      class="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20"
                      :placeholder="t('reviews.commentPh')"
                      :disabled="!isReviewer || savingReview"
                  />
                </div>

                <div class="pt-1">
                  <PrimaryButton :disabled="!canSaveReview" @click="saveMyReview">
                    {{ savingReview ? t("common.loading") : t("common.save") }}
                  </PrimaryButton>
                </div>

                <AlertBox v-if="reviewMsg" class="mt-2" tone="info" :message="reviewMsg" />
                <AlertBox v-if="reviewErr" class="mt-2" tone="error" :message="reviewErr" />
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM -->
        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-white">{{ t("reviews.title") }}</p>
            <p class="text-xs text-white/60">{{ t("reviews.count", { n: rPager?.total ?? 0 }) }}</p>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <TextField
                v-model="rSearch"
                :label="t('reviews.searchLabel')"
                :placeholder="t('reviews.searchPlaceholder')"
                icon="tag"
            />
            <div class="flex gap-2">
              <div class="flex flex-col justify-end">
                <label class="text-xs font-medium text-white/70">{{ t("reviews.ratingMin") }}</label>
                <input
                    v-model.number="rMin"
                    type="number"
                    min="1"
                    max="5"
                    class="mt-2 w-16 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                />
              </div>

              <div class="flex flex-col justify-end">
                <label class="text-xs font-medium text-white/70">{{ t("reviews.ratingMax") }}</label>
                <input
                    v-model.number="rMax"
                    type="number"
                    min="1"
                    max="5"
                    class="mt-2 w-16 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
                />
              </div>
            </div>
          </div>

          <AlertBox v-if="rError" class="mt-4" tone="error" :message="rError" />
          <div v-if="rLoading" class="mt-4 text-sm text-white/60">{{ t("common.loading") }}</div>

          <div v-else class="mt-4 space-y-3">
            <p v-if="rPager && rPager.data.length === 0" class="mt-4 text-sm text-white/60">
              {{ t("reviews.empty") }}
            </p>

            <div
                v-for="r in (rPager?.data ?? [])"
                :key="r.document.id"
                class="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div class="flex items-center justify-between text-xs text-white/60">
                <span>#{{ r.document.content.reviewer_id }}</span>
                <span>
                  {{ r.document.content.created_at ? new Date(r.document.content.created_at).toLocaleString() : "" }}
                </span>
              </div>

              <div class="mt-2">
                <span class="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {{ t("reviews.rating") }}: {{ r.document.content.rating }}
                </span>
              </div>

              <p v-if="r.document.content.comment" class="mt-3 text-sm text-white/80 whitespace-pre-wrap">
                {{ r.document.content.comment }}
              </p>
              <p v-else class="mt-3 text-sm text-white/50">{{ t("reviews.noComment") }}</p>
            </div>

            <!-- Pagination buttons only when exist -->
            <div v-if="hasPrev || hasNext" class="mt-4 flex items-center justify-between gap-2">
              <PrimaryButton v-if="hasPrev" :full="false" @click="gotoPrev">
                {{ t("common.prev") }}
              </PrimaryButton>
              <div v-else class="flex-1" />
              <PrimaryButton v-if="hasNext" :full="false" @click="gotoNext">
                {{ t("common.next") }}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </template>
  </AppShell>
</template>
