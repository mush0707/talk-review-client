<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  modelValue: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: "mail" | "lock" | "user" | "tag";
  error?: string | null;
}>();

const emit = defineEmits<{ (e: "update:modelValue", v: string): void }>();

const iconPath = computed(() => {
  switch (props.icon) {
    case "mail":
      return "M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V6.75Zm2.31.75 7.94 5.29a1.5 1.5 0 0 0 1.67 0l7.94-5.29";
    case "lock":
      return "M6.75 10.5V8.25a5.25 5.25 0 0 1 10.5 0v2.25m-11.25 0h12a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5V12a1.5 1.5 0 0 1 1.5-1.5Z";
    case "user":
      return "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.932 17.932 0 0 1 12 21.75c-2.676 0-5.216-.584-7.5-1.632Z";
    case "tag":
      return "M7.5 4.5h6.879a2.25 2.25 0 0 1 1.59.659l4.872 4.872a2.25 2.25 0 0 1 0 3.182l-7.5 7.5a2.25 2.25 0 0 1-3.182 0l-4.872-4.872A2.25 2.25 0 0 1 3.75 14.25V7.5A3 3 0 0 1 6.75 4.5Zm1.5 4.125a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z";
    default:
      return null;
  }
});
</script>

<template>
  <div>
    <label class="text-xs font-medium text-white/70">{{ label }}</label>

    <div
        class="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition focus-within:border-white/20"
        :class="error ? 'border-red-500/40 bg-red-500/10' : ''"
    >
      <svg v-if="iconPath" viewBox="0 0 24 24" fill="none" class="h-5 w-5 text-white/55">
        <path :d="iconPath" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      <input
          class="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          :type="type ?? 'text'"
          :placeholder="placeholder"
          :value="modelValue"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <p v-if="error" class="mt-2 text-xs text-red-200">{{ error }}</p>
  </div>
</template>
