<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import AppShell from "@/components/ui/AppShell.vue";
import TextField from "@/components/ui/TextField.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import AlertBox from "@/components/ui/AlertBox.vue";
import TagMultiSelect from "@/components/tags/TagMultiSelect.vue";

import { useAuthStore } from "@/stores/auth.store";
import { proposalsApi } from "@/api/proposals/proposals.api";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const title = ref("");
const description = ref("");
const tags = ref({ tagIds: [] as number[], tagNames: [] as string[] });
const file = ref<File | null>(null);

const loading = ref(false);
const errorMsg = ref<string | null>(null);

const canSubmit = computed(() => auth.user?.role === "speaker" && !auth.needsEmailVerification);

function onFile(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null;
}

async function submit() {
  errorMsg.value = null;
  loading.value = true;

  try {
    const form = new FormData();
    form.append("title", title.value);
    form.append("description", description.value);

    for (const id of tags.value.tagIds) form.append("tag_ids[]", String(id));
    for (const name of tags.value.tagNames) form.append("tag_names[]", name);

    if (file.value) form.append("file", file.value);

    const created = await proposalsApi.create(form);
    router.replace(`/proposals/${created.id}`);
  } catch (e: any) {
    errorMsg.value = e?.message ?? t("common.error");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AppShell :title="t('proposals.newTitle')" :subtitle="t('proposals.newSubtitle')">
    <template #top-right>
      <button
          class="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          @click="router.push('/proposals')"
      >
        {{ t("common.back") }}
      </button>
    </template>

    <div class="mx-auto max-w-3xl">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <AlertBox v-if="!canSubmit" tone="error" :message="'Email verification is required to submit proposals.'" />

        <div class="space-y-4">
          <TextField v-model="title" :label="t('proposals.fields.title')" :placeholder="t('proposals.fields.titlePh')" icon="tag" />

          <div>
            <label class="text-xs font-medium text-white/70">{{ t("proposals.fields.description") }}</label>
            <textarea
                v-model="description"
                rows="6"
                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                :placeholder="t('proposals.fields.descriptionPh')"
            />
          </div>

          <TagMultiSelect v-model="tags" :allow-create="true" />

          <div>
            <label class="text-xs font-medium text-white/70">
              {{ t("proposals.fields.file") }} <span class="text-white/50">({{ t("common.optional") }})</span>
            </label>
            <input
                type="file"
                accept="application/pdf"
                class="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
                @change="onFile"
            />
            <p class="mt-2 text-xs text-white/50">{{ t("proposals.fields.fileHint") }}</p>
          </div>
        </div>

        <p v-if="errorMsg" class="mt-4 text-sm text-rose-200">{{ errorMsg }}</p>

        <div class="mt-6 flex items-center justify-end">
          <PrimaryButton :disabled="loading || !canSubmit" @click="submit">
            {{ loading ? t("common.loading") : t("common.submit") }}
          </PrimaryButton>
        </div>
      </div>
    </div>
  </AppShell>
</template>
