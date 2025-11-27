<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import AlertBox from "@/components/ui/AlertBox.vue";

const { t } = useI18n();
const auth = useAuthStore();

const msg = ref<string | null>(null);

async function resend() {
  msg.value = null;
  try {
    await auth.resendVerification();
    msg.value = t("auth.verify.sent");
  } catch (e: any) {
    msg.value = e?.message ?? t("auth.verify.failed");
  }
}
</script>

<template>
  <div class="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm font-semibold text-white">{{ t("auth.verify.title") }}</p>
        <p class="mt-1 text-sm text-white/70">{{ t("auth.verify.desc") }}</p>
      </div>

      <button
          class="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
          :disabled="auth.loading"
          @click="resend"
      >
        {{ t("auth.verify.resend") }}
      </button>
    </div>

    <AlertBox v-if="msg" class="mt-4" tone="info" :message="msg" />
  </div>
</template>
