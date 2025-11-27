<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import AppShell from "@/components/ui/AppShell.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const ok = computed(() => route.query.ok === "1");

onMounted(async () => {
  await auth.bootstrap();
});
</script>

<template>
  <AppShell
      :title="ok ? t('auth.verifiedPage.okTitle') : t('auth.verifiedPage.failTitle')"
      :subtitle="ok ? t('auth.verifiedPage.okSubtitle') : t('auth.verifiedPage.failSubtitle')"
  >
    <div class="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div
          class="rounded-2xl border p-4"
          :class="ok ? 'border-emerald-400/30 bg-emerald-400/10' : 'border-red-400/30 bg-red-400/10'"
      >
        <p class="font-semibold">
          {{ ok ? t("auth.verifiedPage.successBoxTitle") : t("auth.verifiedPage.failBoxTitle") }}
        </p>
        <p class="mt-1 text-sm text-white/75">
          {{ ok ? t("auth.verifiedPage.successBoxText") : t("auth.verifiedPage.failBoxText") }}
        </p>
      </div>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
            class="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900"
            @click="router.push('/')"
        >
          {{ t("auth.verifiedPage.goDashboard") }}
        </button>

        <button
            class="flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15"
            @click="router.push('/login')"
        >
          {{ t("auth.verifiedPage.goLogin") }}
        </button>
      </div>
    </div>
  </AppShell>
</template>
