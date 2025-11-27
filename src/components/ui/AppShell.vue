<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="min-h-screen">
    <!-- background -->
    <div class="fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"></div>
      <div class="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>
      <div class="absolute top-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.16)_1px,transparent_0)] [background-size:18px_18px]"  ></div>
    </div>

    <div class="mx-auto max-w-6xl px-6 py-10">
      <header class="flex items-center justify-between gap-4">
        <div>
          <h1 v-if="title" class="text-2xl font-semibold tracking-tight text-white">{{ title }}</h1>
          <p v-if="subtitle" class="mt-1 text-sm text-white/70">{{ subtitle }}</p>
        </div>
        <slot name="top-right" />
      </header>

      <main class="mt-8">
        <slot />
      </main>
    </div>
  </div>
</template>
