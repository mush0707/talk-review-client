<script setup lang="ts">
defineProps<{
  heading: string;
  tagline?: string;
}>();
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div class="mb-6">
        <h2 class="text-xl font-semibold text-white">{{ heading }}</h2>
        <p v-if="tagline" class="mt-1 text-sm text-white/70">{{ tagline }}</p>
      </div>

      <slot />
    </div>

    <p class="mt-6 text-center text-xs text-white/50">
      Token-based auth • Laravel Sanctum • Tailwind UI
    </p>
  </div>
</template>