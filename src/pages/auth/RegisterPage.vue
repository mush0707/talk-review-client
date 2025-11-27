<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import AppShell from "@/components/ui/AppShell.vue";
import AuthCard from "@/components/ui/AuthCard.vue";
import TextField from "@/components/ui/TextField.vue";
import PrimaryButton from "@/components/ui/PrimaryButton.vue";
import AlertBox from "@/components/ui/AlertBox.vue";
import RolePicker, { type RoleKey } from "@/components/auth/RolePicker.vue";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const name = ref("");
const email = ref("");
const role = ref<RoleKey>("speaker");
const password = ref("");
const password_confirmation = ref("");

const errorMsg = ref<string | null>(null);

const canSubmit = computed(() => {
  return (
      name.value.trim().length >= 2 &&
      email.value.includes("@") &&
      password.value.length >= 6 &&
      password.value === password_confirmation.value
  );
});

async function submit() {
  errorMsg.value = null;
  try {
    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      role: role.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
    });
    router.push("/");
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Registration failed";
  }
}

const roleLabels = computed(() => ({
  label: t("auth.register.roleLabel"),
  options: {
    speaker: { title: t("auth.register.roles.speaker.title"), desc: t("auth.register.roles.speaker.desc") },
    reviewer: { title: t("auth.register.roles.reviewer.title"), desc: t("auth.register.roles.reviewer.desc") },
    admin: { title: t("auth.register.roles.admin.title"), desc: t("auth.register.roles.admin.desc") },
  },
}));
</script>

<template>
  <AppShell :title="t('auth.register.title')" :subtitle="t('auth.register.subtitle')">
    <AuthCard :heading="t('auth.register.cardTitle')" :tagline="t('auth.register.cardTagline')">
      <AlertBox
          v-if="errorMsg"
          tone="error"
          :title="t('auth.register.errorTitle')"
          :message="errorMsg"
          class="mb-5"
      />

      <form class="space-y-4" @submit.prevent="submit">
        <TextField
            v-model="name"
            :label="t('auth.register.name')"
            placeholder="John Doe"
            icon="user"
        />

        <TextField
            v-model="email"
            :label="t('auth.register.email')"
            type="email"
            placeholder="you@example.com"
            icon="mail"
        />

        <RolePicker v-model="role" :labels="roleLabels" />

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
              v-model="password"
              :label="t('auth.register.password')"
              type="password"
              placeholder="••••••••"
              icon="lock"
          />
          <TextField
              v-model="password_confirmation"
              :label="t('auth.register.confirm')"
              type="password"
              placeholder="••••••••"
              icon="lock"
          />
        </div>

        <PrimaryButton :loading="auth.loading" :disabled="!canSubmit">
          {{ t("auth.register.submit") }}
        </PrimaryButton>

        <div class="flex items-center justify-between pt-2 text-xs text-white/70">
          <span>{{ t("auth.register.footerHint") }}</span>
          <router-link class="text-white underline underline-offset-4 hover:text-white/90" to="/login">
            {{ t("auth.register.footerLink") }}
          </router-link>
        </div>
      </form>
    </AuthCard>
  </AppShell>
</template>
