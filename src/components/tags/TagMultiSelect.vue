<!-- src/components/tags/TagMultiSelect.vue -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { tagsApi } from "@/api/tags/tags.api";
import type { Tag } from "@/api/tags/types";

type ModelValue = { tagIds: number[]; tagNames: string[] };

const props = defineProps<{
  modelValue: ModelValue;
  allowCreate?: boolean;
}>();

const emit = defineEmits<{ (e: "update:modelValue", v: ModelValue): void }>();
const { t } = useI18n();

const q = ref("");
const open = ref(false);
const loading = ref(false);
const suggestions = ref<Tag[]>([]);

const selectedIdToName = ref<Record<number, string>>({});

const selectedIds = computed(() => new Set(props.modelValue.tagIds));
const selectedNames = computed(() => new Set(props.modelValue.tagNames.map((x) => x.toLowerCase())));

// ✅ Expose map to template easily
const selectedIdToNameMap = computed(() => selectedIdToName.value);

watch(
    () => props.modelValue.tagIds.slice(),
    (ids) => {
      const next: Record<number, string> = {};
      for (const id of ids) next[id] = selectedIdToName.value[id] ?? `#${id}`;
      selectedIdToName.value = next;
    },
    { immediate: true }
);

function setValue(next: Partial<ModelValue>) {
  emit("update:modelValue", {
    tagIds: next.tagIds ?? props.modelValue.tagIds,
    tagNames: next.tagNames ?? props.modelValue.tagNames,
  });
}

async function fetchTags() {
  const query = q.value.trim();
  if (!query) {
    suggestions.value = [];
    return;
  }

  loading.value = true;
  try {
    suggestions.value = await tagsApi.list({ search: query, limit: 20 });
  } finally {
    loading.value = false;
  }
}

watch(q, () => {
  open.value = true;
  fetchTags();
});

function addExisting(tag: Tag) {
  if (selectedIds.value.has(tag.id)) return;

  selectedIdToName.value = { ...selectedIdToName.value, [tag.id]: tag.name };
  setValue({ tagIds: [...props.modelValue.tagIds, tag.id] });

  q.value = "";
  open.value = false;
}

function removeExisting(id: number) {
  const { [id]: _, ...rest } = selectedIdToName.value;
  selectedIdToName.value = rest;

  setValue({ tagIds: props.modelValue.tagIds.filter((x) => x !== id) });
}

function addNewName(name: string) {
  const n = name.trim();
  if (!n) return;
  if (selectedNames.value.has(n.toLowerCase())) return;

  setValue({ tagNames: [...props.modelValue.tagNames, n] });

  q.value = "";
  open.value = false;
}

function removeNewName(name: string) {
  setValue({ tagNames: props.modelValue.tagNames.filter((x) => x !== name) });
}

function onKeydown(e: KeyboardEvent) {
  if (!props.allowCreate) return;
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    addNewName(q.value);
  }
}
</script>

<template>
  <div class="relative">
    <label class="text-xs font-medium text-white/70">{{ t("tags.label") }}</label>

    <div class="mt-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <div class="flex flex-wrap gap-2">
        <!-- ✅ existing tags (id -> proper name) -->
        <span
            v-for="id in modelValue.tagIds"
            :key="'id-' + id"
            class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/90"
        >
          {{ selectedIdToNameMap[id] ?? `#${id}` }}
          <button class="text-white/70 hover:text-white" type="button" @click="removeExisting(id)">
            ×
          </button>
        </span>

        <!-- new tags (names) -->
        <span
            v-for="name in modelValue.tagNames"
            :key="'name-' + name"
            class="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-50"
        >
          {{ name }}
          <button class="text-emerald-100/70 hover:text-emerald-50" type="button" @click="removeNewName(name)">
            ×
          </button>
        </span>

        <input
            v-model="q"
            :placeholder="t('tags.placeholder')"
            class="min-w-[160px] flex-1 bg-transparent py-1 text-sm text-white placeholder:text-white/40 outline-none"
            @focus="open = true"
            @keydown="onKeydown"
        />
      </div>

      <div
          v-if="open && (loading || suggestions.length || (allowCreate && q.trim()))"
          class="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-2"
      >
        <div v-if="loading" class="px-3 py-2 text-xs text-white/60">
          {{ t("common.loading") }}
        </div>

        <button
            v-for="tag in suggestions"
            :key="tag.id"
            type="button"
            class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
            @click="addExisting(tag)"
        >
          <span>{{ tag.name }}</span>
          <span class="text-xs text-white/50">#{{ tag.id }}</span>
        </button>

        <div v-if="!loading && suggestions.length === 0 && !q.trim()" class="px-3 py-2 text-xs text-white/60">
          {{ t("tags.empty") }}
        </div>

        <button
            v-if="allowCreate && q.trim() && !selectedNames.has(q.trim().toLowerCase())"
            type="button"
            class="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-emerald-100 hover:bg-emerald-500/10"
            @click="addNewName(q)"
        >
          <span>{{ t("tags.create") }} “{{ q.trim() }}”</span>
          <span class="text-xs opacity-70">Enter</span>
        </button>
      </div>
    </div>
  </div>
</template>
