<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import AppShell from "@/components/ui/AppShell.vue";
import AuthCard from "@/components/ui/AuthCard.vue";
import TextField from "@/components/ui/TextField.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import AlertBox from "@/components/ui/AlertBox.vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const errorMsg = ref<string | null>(null);

async function submit() {
  errorMsg.value = null;
  try {
    await auth.login(email.value.trim(), password.value);
    router.push("/");
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Login failed";
  }
}
</script>

<template>
  <AppShell :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <AuthCard :heading="t('auth.login.cardTitle')" :tagline="t('auth.login.cardTagline')">
      <AlertBox
          v-if="errorMsg"
          tone="error"
          :title="t('auth.login.errorTitle')"
          :message="errorMsg"
          class="mb-5"
      />

      <form class="space-y-4" @submit.prevent="submit">
        <TextField
            v-model="email"
            :label="t('auth.login.email')"
            type="email"
            placeholder="you@example.com"
            icon="mail"
        />
        <TextField
            v-model="password"
            :label="t('auth.login.password')"
            type="password"
            placeholder="••••••••"
            icon="lock"
        />

        <PrimaryButton :loading="auth.loading">
          {{ t("auth.login.submit") }}
        </PrimaryButton>

        <div class="flex items-center justify-between pt-2 text-xs text-white/70">
          <span>{{ t("auth.login.footerHint") }}</span>
          <router-link class="text-white underline underline-offset-4 hover:text-white/90" to="/register">
            {{ t("auth.login.footerLink") }}
          </router-link>
        </div>
      </form>
    </AuthCard>
  </AppShell>
</template>
