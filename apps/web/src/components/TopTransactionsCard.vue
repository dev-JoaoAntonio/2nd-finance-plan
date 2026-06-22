<script setup lang="ts">
import { formatCurrency } from '@/utils/format';
import type { Transaction } from '@/types';
import Icon from './Icon.vue';

defineProps<{ items: Transaction[] }>();

function ddmm(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
</script>

<template>
  <div class="card h-full p-5">
    <div class="section-tag">
      <Icon name="barChart" :size="14" class="text-sky-600" />
      Top 5 gastos do mês
    </div>

    <ul v-if="items.length" class="mt-3 space-y-2.5">
      <li v-for="(t, i) in items" :key="t.id" class="flex items-center gap-3">
        <span class="w-6 font-mono text-xs font-bold text-ink-300">
          {{ String(i + 1).padStart(2, '0') }}
        </span>
        <span
          class="h-2.5 w-2.5 shrink-0 rounded-full"
          :style="{ background: t.category?.color ?? '#94a3b8' }"
        />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium text-ink-800">
            {{ t.description || t.category?.name || 'Transação' }}
          </div>
          <div class="text-[11px] text-ink-400">
            {{ t.category?.name ?? 'Sem categoria' }} · {{ ddmm(t.occurredAt) }}
          </div>
        </div>
        <span class="font-mono text-sm font-bold text-ink-800">
          {{ formatCurrency(t.amount) }}
        </span>
      </li>
    </ul>

    <div v-else class="mt-8 text-center text-sm text-ink-400">
      Nenhuma transação neste mês.
    </div>
  </div>
</template>
