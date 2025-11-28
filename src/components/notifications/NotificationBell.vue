<template>
  <div ref="rootRef" class="relative">
    <button
        type="button"
        class="relative inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.99]"
        @click.stop="toggle"
    >
      <span class="sr-only">{{ t("notifications.title") }}</span>
      <span aria-hidden="true">🔔</span>

      <span
          v-if="badge > 0"
          class="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white"
      >
        {{ badge }}
      </span>
    </button>

    <div
        v-if="open"
        ref="panelRef"
        class="z-50 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40 backdrop-blur-xl
             fixed left-4 right-4 top-16
             sm:absolute sm:right-0 sm:left-auto sm:top-auto sm:mt-2 sm:w-[420px]"
        @click.stop
    >
      <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div class="text-sm font-semibold text-white">{{ t("notifications.title") }}</div>

        <div class="flex items-center gap-2">
          <button
              type="button"
              class="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
              @click.stop="refresh"
              :disabled="ns.loading"
          >
            {{ t("common.refresh") }}
          </button>

          <button
              type="button"
              class="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              @click.stop="closePanel"
              aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div class="px-4 py-3">
        <!-- ✅ Search input -->
        <div class="mb-3">
          <input
              v-model="search"
              type="text"
              class="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 outline-none"
              :placeholder="t('notifications.search')"
          />
        </div>

        <div v-if="ns.loading" class="text-sm text-white/70">
          {{ t("common.loading") }}
        </div>

        <div v-else-if="ns.error" class="text-sm text-rose-200">
          {{ ns.error }}
        </div>

        <div v-else-if="!ns.items || ns.items.length === 0" class="text-sm text-white/60">
          {{ t("notifications.empty") }}
        </div>

        <div v-else class="max-h-[55vh] space-y-2 overflow-auto pr-1 sm:max-h-[420px]">
          <div
              v-for="n in ns.items"
              :key="n.id"
              class="rounded-2xl border border-white/10 bg-white/5 p-3"
              :class="n.read_at ? 'opacity-80' : 'ring-1 ring-white/10'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm font-semibold text-white">
                  {{ formatTitle(n) }}
                </div>
                <div class="mt-1 text-xs text-white/60">
                  {{ formatDate(n.created_at) }}
                </div>
              </div>

              <span
                  v-if="!n.read_at"
                  class="shrink-0 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200"
              >
                {{ t("notifications.unread") }}
              </span>
            </div>

            <div v-if="formatBody(n)" class="mt-2 text-sm text-white/75">
              {{ formatBody(n) }}
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div class="text-xs text-white/60">
            {{ t("notifications.unreadCount", { count: ns.unread }) }}
          </div>

          <button
              type="button"
              class="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
              @click.stop="markAllRead"
              :disabled="ns.loading"
          >
            {{ t("notifications.markAllRead") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNotificationsStore } from "@/stores/notifications.store";
import type { NotificationItem } from "@/api/notifications/types";

const { t } = useI18n();
const ns = useNotificationsStore();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const badge = computed(() => ns.unread ?? 0);

// ✅ search
const search = ref("");
let searchTimer: number | null = null;

function onDocPointerDown(e: PointerEvent) {
  const target = e.target as Node | null;
  if (!target) return;
  if (rootRef.value?.contains(target)) return;
  closePanel();
}

function attachOutside() {
  document.addEventListener("pointerdown", onDocPointerDown, true);
}
function detachOutside() {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
}

async function openPanel() {
  open.value = true;
  attachOutside();

  await ns.fetchLatest({ limit: 20, search: search.value.trim() || undefined });
  await ns.readAllRemote();
}

function closePanel() {
  open.value = false;
  detachOutside();
}

async function toggle() {
  if (open.value) return closePanel();
  await openPanel();
}

async function refresh() {
  // ✅ Always refresh unread count on refresh click
  await ns.refreshUnread();
  // keep your list refresh too
  await ns.fetchLatest({ limit: 20, search: search.value.trim() || undefined });
}

async function markAllRead() {
  await ns.readAllRemote();
}

// ✅ auto-search when typing
watch(search, () => {
  if (!open.value) return;

  if (searchTimer) window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(async () => {
    await ns.fetchLatest({ limit: 20, search: search.value.trim() || undefined });
  }, 300);
});

// ✅ Always refresh unread count regardless of page:
// - on mount
// - when tab becomes visible
// - when window gets focus
function onVisibilityOrFocus() {
  ns.refreshUnread();
}

onMounted(() => {
  ns.refreshUnread();
  window.addEventListener("focus", onVisibilityOrFocus);
  document.addEventListener("visibilitychange", onVisibilityOrFocus);
});

onBeforeUnmount(() => {
  detachOutside();
  window.removeEventListener("focus", onVisibilityOrFocus);
  document.removeEventListener("visibilitychange", onVisibilityOrFocus);
});

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function formatTitle(n: NotificationItem) {
  const type = (n.data?.type ?? "").toString();
  if (type === "proposal_submitted") return t("notifications.types.proposal_submitted");
  if (type === "proposal_reviewed") return t("notifications.types.proposal_reviewed");
  if (type === "proposal_status_changed") return t("notifications.types.proposal_status_changed");
  return t("notifications.types.unknown");
}

function formatBody(n: NotificationItem) {
  const type = (n.data?.type ?? "").toString();
  const title = (n.data?.title ?? "").toString();

  if (type === "proposal_status_changed") {
    const status = (n.data?.status ?? "").toString();
    return title ? `${title} — ${status}` : status;
  }

  return title || (n.data?.comment ? String(n.data.comment) : "");
}
</script>
