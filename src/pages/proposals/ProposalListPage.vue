<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppShell from "@/components/ui/AppShell.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import TextField from "@/components/ui/TextField.vue";
import VerifyEmailInfoCard from "@/pages/auth/VerifyEmailInfoCard.vue";
import TagMultiSelect from "@/components/tags/TagMultiSelect.vue";

import { useAuthStore } from "@/stores/auth.store";
import { proposalsApi } from "@/api/proposals/proposals.api";
import type { LaravelPaginator, ProposalSearchHit, ProposalStatus } from "@/api/proposals/types";
import ProposalStatusBadge from "@/components/ui/ProposalStatusBadge.vue";
import { normalizeApiError } from "@/api/http/error";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const isSpeaker = computed(() => auth.user?.role === "speaker");
const canCreate = computed(() => isSpeaker.value && !auth.needsEmailVerification);

const search = ref("");
const status = ref<ProposalStatus | "">("");
const tags = ref({ tagIds: [] as number[], tagNames: [] as string[] });
const page = ref(1);

const loading = ref(false);
const errorMsg = ref<string | null>(null);
const pager = ref<LaravelPaginator<ProposalSearchHit> | null>(null);

const hasPrev = computed(() => !!pager.value?.prev_page_url && (pager.value?.current_page ?? 1) > 1);
const hasNext = computed(() => !!pager.value?.next_page_url && (pager.value?.current_page ?? 1) < (pager.value?.last_page ?? 1));

const filtersOpen = ref(false);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    pager.value = await proposalsApi.search({
      search: search.value.trim() || undefined,
      status: (status.value || undefined) as any,
      tag_ids: tags.value.tagIds.length ? tags.value.tagIds : undefined,
      page: page.value,
      per_page: 15,
    });
  } catch (e: any) {
    errorMsg.value = normalizeApiError(e).message ?? t("common.error");
    pager.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await auth.bootstrap();
  load();
});

watch([search, status, () => tags.value.tagIds.join(",")], () => {
  page.value = 1;
  load();
});
</script>

<template>
  <AppShell :title="t('proposals.title')" :subtitle="t('proposals.subtitle')">
    <template #top-right>
      <button
          v-if="isSpeaker"
          class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-95 disabled:opacity-60"
          :disabled="!canCreate"
          @click="router.push('/proposals/new')"
      >
        {{ t("proposals.create") }}
      </button>

      <button
          type="button"
          class="sm:hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          @click="filtersOpen = !filtersOpen"
      >
        {{ t("proposals.filters") }}
      </button>
    </template>

    <div v-if="auth.needsEmailVerification" class="mb-6">
      <VerifyEmailInfoCard />
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div
          class="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl"
          :class="filtersOpen ? '' : 'hidden sm:block'"
      >
        <div class="flex items-center justify-between sm:block">
          <p class="text-sm font-semibold text-white">{{ t("proposals.filters") }}</p>
          <button
              type="button"
              class="sm:hidden text-xs text-white/70 underline underline-offset-4"
              @click="filtersOpen = false"
          >
            {{ t("common.cancel") }}
          </button>
        </div>

        <div class="mt-4 space-y-4">
          <TextField
              v-model="search"
              :label="t('proposals.searchLabel')"
              :placeholder="t('proposals.searchPlaceholder')"
              icon="tag"
          />

          <div>
            <label class="text-xs font-medium text-white/70">{{ t("proposals.statusLabel") }}</label>
            <select
                v-model="status"
                class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-white/20"
            >
              <option value="">{{ t("proposals.statusAll") }}</option>
              <option value="pending">{{ t("status.pending") }}</option>
              <option value="approved">{{ t("status.approved") }}</option>
              <option value="rejected">{{ t("status.rejected") }}</option>
            </select>
          </div>

          <TagMultiSelect v-model="tags" :allow-create="false" />
        </div>
      </div>

      <div class="lg:col-span-2 min-w-0">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-white/60">{{ t("proposals.total", { n: pager?.total ?? 0 }) }}</p>

          <div v-if="pager && (hasPrev || hasNext)" class="flex items-center gap-2">
            <PrimaryButton v-if="hasPrev" @click="page--; load()">
              {{ t("common.prev") }}
            </PrimaryButton>

            <span class="text-xs text-white/60 px-2">
              {{ pager.current_page }}
            </span>

            <PrimaryButton v-if="hasNext" @click="page++; load()">
              {{ t("common.next") }}
            </PrimaryButton>
          </div>
        </div>

        <p v-if="errorMsg" class="mt-4 text-sm text-rose-200">{{ errorMsg }}</p>
        <div v-if="loading" class="mt-4 text-sm text-white/60">{{ t("common.loading") }}</div>

        <div v-else class="mt-4 space-y-4">
          <button
              v-for="hit in (pager?.data ?? [])"
              :key="hit.document.id"
              type="button"
              class="w-full text-left rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl hover:bg-white/10 transition"
              @click="router.push(`/proposals/${hit.document.id}`)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-base font-semibold text-white">
                  {{ hit.document.content.title }}
                </p>
                <p class="mt-1 line-clamp-2 text-sm text-white/70">
                  {{ hit.document.content.description }}
                </p>
              </div>
              <ProposalStatusBadge
                  :status="hit.document.content.status"
                  :label="t(`status.${hit.document.content.status}`)"
              />
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <span
                  v-for="(name, idx) in (hit.document.content.tag_names ?? [])"
                  :key="name + idx"
                  class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
              >
                {{ name }}
              </span>
            </div>

            <div class="mt-4 flex items-center justify-between text-xs text-white/50">
              <span>
                {{
                  hit.document.content.created_at ? new Date(hit.document.content.created_at).toLocaleString() : ""
                }}
              </span>
            </div>
          </button>

          <div
              v-if="pager && pager.data.length === 0"
              class="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70"
          >
            {{ t("proposals.listEmpty") }}
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>
