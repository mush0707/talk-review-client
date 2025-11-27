<script setup lang="ts">
defineProps<{
  title?: string;
  message: string;
  tone?: "error" | "info";
}>();
</script>

<template>
  <div
      class="rounded-2xl border p-4 text-sm"
      :class="tone === 'error'
      ? 'border-red-500/40 bg-red-500/10 text-red-100'
      : 'border-white/10 bg-white/5 text-white/80'"
  >
    <p v-if="title" class="font-semibold">{{ title }}</p>
    <p class="mt-1 leading-relaxed">{{ message }}</p>
  </div>
</template>
