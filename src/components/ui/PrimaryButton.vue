<script setup lang="ts">
withDefaults(
    defineProps<{
      loading?: boolean;
      disabled?: boolean;

      // NEW: allow inline button usage (pagination etc.)
      full?: boolean;
    }>(),
    {
      full: true,
    }
);
</script>

<template>
  <button
      class="group relative overflow-hidden rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition disabled:opacity-50"
      :class="full ? 'w-full' : ''"
      :disabled="disabled || loading"
  >
    <span
        class="absolute inset-0 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 opacity-0 transition group-hover:opacity-100"
    ></span>
    <span class="relative flex items-center justify-center gap-2">
      <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25"></circle>
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2"></path>
      </svg>
      <slot />
    </span>
  </button>
</template>
