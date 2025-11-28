<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
import AppShell from "@/components/ui/AppShell.vue";
import VerifyEmailInfoCard from "@/pages/auth/VerifyEmailInfoCard.vue";

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();
const headline = computed(() => (auth.user ? `Hi, ${auth.user.name}` : t("dashboard.titleFallback")));
const subtitle = computed(() => (auth.user ? `${auth.user.email} • role: ${auth.user.role}` : ""));

const isSpeaker = computed(() => auth.user?.role === "speaker"); // must match backend role slug
</script>

<template>
  <AppShell :title="headline" :subtitle="subtitle">
    <template #top-right>
      <div class="flex gap-x-2">
        <button v-if="isSpeaker"
                class="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:opacity-95"
                @click="router.push('/proposals/new')"
        >
          {{ t("dashboard.speakerCta.button") }}
        </button>
      </div>
    </template>

    <div class="grid gap-6 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <div v-if="!auth.emailVerified" class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <p class="text-sm font-semibold text-white">{{ t("dashboard.sessionTitle") }}</p>
          <p class="mt-2 text-sm text-white/70">
            {{ t("dashboard.sessionText") }}
          </p>

          <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs text-white/60">{{ t("dashboard.stats.verifyRequired") }}</p>
              <p class="mt-1 text-lg font-semibold text-white">
                {{ auth.mustVerifyEmail ? t("dashboard.stats.yes") : t("dashboard.stats.no") }}
              </p>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs text-white/60">{{ t("dashboard.stats.verified") }}</p>
              <p class="mt-1 text-lg font-semibold text-white">
                {{ auth.emailVerified ? t("dashboard.stats.yes") : t("dashboard.stats.no") }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="auth.needsEmailVerification" class="mt-6">
          <VerifyEmailInfoCard />
        </div>
      </div>
    </div>
  </AppShell>
</template>
