<script setup lang="ts">
import { computed } from "vue";

export type RoleKey = "speaker" | "listener" | "admin";

type RoleOption = {
  key: RoleKey;
  title: string;
  desc: string;
  icon: "mic" | "headphones" | "shield";
};

const props = defineProps<{
  modelValue: RoleKey;
  labels: {
    label: string;
    options: Record<RoleKey, { title: string; desc: string }>;
  };
}>();

const emit = defineEmits<{ (e: "update:modelValue", v: RoleKey): void }>();

const options = computed<RoleOption[]>(() => [
  {
    key: "speaker",
    title: props.labels.options.speaker.title,
    desc: props.labels.options.speaker.desc,
    icon: "mic",
  },
  {
    key: "reviewer",
    title: props.labels.options.reviewer.title,
    desc: props.labels.options.reviewer.desc,
    icon: "headphones",
  },
  {
    key: "admin",
    title: props.labels.options.admin.title,
    desc: props.labels.options.admin.desc,
    icon: "shield",
  },
]);

function iconPath(kind: RoleOption["icon"]) {
  if (kind === "mic")
    return "M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm-7-3a7 7 0 0 0 14 0m-7 7v3m-4 0h8";
  if (kind === "headphones")
    return "M4 13a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3M4 13v5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H4";
  return "M12 3l7 4v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V7l7-4Z";
}

function pick(v: RoleKey) {
  emit("update:modelValue", v);
}
</script>

<template>
  <div>
    <label class="text-xs font-medium text-white/70">{{ labels.label }}</label>

    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
          v-for="o in options"
          :key="o.key"
          type="button"
          @click="pick(o.key)"
          class="group text-left rounded-2xl border p-4 transition backdrop-blur-xl"
          :class="
          modelValue === o.key
            ? 'border-white bg-white/10 shadow-lg shadow-black/30'
            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7'
        "
      >
        <div class="flex items-start gap-3">
          <div
              class="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5"
              :class="modelValue === o.key ? 'bg-white/10' : ''"
          >
            <svg class="h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="none">
              <path
                  :d="iconPath(o.icon)"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-white">{{ o.title }}</p>
            <p class="mt-1 text-xs text-white/65 leading-snug">{{ o.desc }}</p>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
