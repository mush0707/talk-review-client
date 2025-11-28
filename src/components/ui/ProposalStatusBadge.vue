<script setup lang="ts">
import type { ProposalStatus } from "@/api/proposals/types";
import { statusBadgeClass } from "@/utils/statusBadge";

defineProps<{ status: ProposalStatus; label: string }>();
</script>

<template>
  <span class="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold" :class="statusBadgeClass(status)">
    {{ label }}
  </span>
</template>
