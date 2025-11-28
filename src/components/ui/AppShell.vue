<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { useAuthStore } from "@/stores/auth.store";
import { useNotificationsStore } from "@/stores/notifications.store";
import NotificationBell from "@/components/notifications/NotificationBell.vue";

defineProps<{
  title?: string;
  subtitle?: string;
}>();

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const ns = useNotificationsStore();

const showGlobalActions = computed(() => auth.isLoggedIn);

async function onLogout() {
  await auth.logout();
  router.replace("/login");
}

onMounted(async () => {
  await auth.bootstrap();
});

watch(
    () => auth.user?.id,
    (id) => {
      if (!id) return;
      ns.connectIfConfigured();
    },
    { immediate: true }
);
</script>

<template>
  <div class="min-h-screen">
    <!-- background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"></div>
      <div class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div class="absolute top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div
          class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.16)_1px,transparent_0)] [background-size:18px_18px]"
      ></div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <h1 v-if="title" class="text-2xl font-semibold tracking-tight text-white">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="mt-1 text-sm text-white/70">
            {{ subtitle }}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <NotificationBell v-if="showGlobalActions" />

          <slot name="top-right" />

          <button
              v-if="showGlobalActions"
              type="button"
              class="whitespace-nowrap rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              @click="onLogout"
          >
            {{ t("common.logout") }}
          </button>
        </div>
      </header>

      <main class="mt-6 sm:mt-8">
        <slot />
      </main>
    </div>
  </div>
</template>
