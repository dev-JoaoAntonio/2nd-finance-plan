<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';
import Icon from './Icon.vue';
import type { Transaction } from '@/types';

const props = defineProps<{ transaction: Transaction }>();
defineEmits<{ edit: [Transaction]; delete: [Transaction] }>();

const ddmm = computed(() => {
  const [, m, d] = props.transaction.occurredAt.split('-');
  return `${d}/${m}`;
});
const catColor = computed(() => props.transaction.category?.color ?? '#94a3b8');
</script>

<template>
  <div class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5 transition hover:border-ink-300">
    <div class="grid h-10 w-12 shrink-0 place-content-center rounded-lg bg-slate-100 text-xs font-bold text-ink-500">
      {{ ddmm }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-medium text-ink-800">
        {{ transaction.description || 'Sem descrição' }}
      </div>
      <span
        class="mt-0.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold"
        :style="{ background: `${catColor}1a`, color: catColor }"
      >
        {{ transaction.category?.name ?? 'Sem categoria' }}
      </span>
    </div>
    <span class="font-mono text-sm font-bold text-ink-800">{{ formatCurrency(transaction.amount) }}</span>
    <div class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
      <button class="grid h-8 w-8 place-content-center rounded-lg text-sky-600 hover:bg-sky-50" aria-label="Editar" @click="$emit('edit', transaction)">
        <Icon name="edit" :size="16" />
      </button>
      <button class="grid h-8 w-8 place-content-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Excluir" @click="$emit('delete', transaction)">
        <Icon name="trash" :size="16" />
      </button>
    </div>
  </div>
</template>
