<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency, parseInput } from '@/utils/format';
import Icon from './Icon.vue';
import type { ComputedExpense } from '@/types';

const props = defineProps<{ expense: ComputedExpense }>();
const emit = defineEmits<{
  'update-spent': [string, number];
  edit: [ComputedExpense];
  delete: [ComputedExpense];
}>();

const availClass = computed(() => {
  const e = props.expense;
  if (e.adjusted < 0) return 'text-rose-600';
  if (e.adjusted < e.balance) return 'text-amber-600';
  return 'text-sky-700';
});

function commitSpent(ev: Event) {
  const value = parseInput((ev.target as HTMLInputElement).value);
  emit('update-spent', props.expense.id, value);
}
</script>

<template>
  <div class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5 transition hover:border-ink-300">
    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-semibold text-ink-800">{{ expense.title }}</div>
      <div v-if="expense.description" class="truncate text-[11px] text-ink-400">
        {{ expense.description }}
      </div>
    </div>

    <div class="hidden text-right sm:block">
      <div class="text-[10px] font-semibold uppercase text-ink-400">Plan.</div>
      <div class="font-mono text-xs font-bold text-ink-700">{{ formatCurrency(expense.amount) }}</div>
    </div>

    <div class="w-28">
      <div class="text-[10px] font-semibold uppercase text-ink-400">Gasto</div>
      <div class="flex items-center rounded-lg border border-ink-200 px-2 focus-within:border-sky-500">
        <span class="text-xs text-ink-400">R$</span>
        <input
          class="w-full bg-transparent px-1 py-1 text-right font-mono text-xs text-ink-800 outline-none"
          inputmode="decimal"
          :value="expense.spentAmount.toFixed(2).replace('.', ',')"
          @change="commitSpent"
          @blur="commitSpent"
        />
      </div>
    </div>

    <div class="hidden text-right sm:block">
      <div class="text-[10px] font-semibold uppercase text-ink-400">Disp.</div>
      <div class="font-mono text-xs font-bold" :class="availClass">
        {{ formatCurrency(expense.adjusted) }}
      </div>
    </div>

    <div class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
      <button class="grid h-8 w-8 place-content-center rounded-lg text-sky-600 hover:bg-sky-50" aria-label="Editar" @click="emit('edit', expense)">
        <Icon name="edit" :size="16" />
      </button>
      <button class="grid h-8 w-8 place-content-center rounded-lg text-rose-600 hover:bg-rose-50" aria-label="Excluir" @click="emit('delete', expense)">
        <Icon name="trash" :size="16" />
      </button>
    </div>
  </div>
</template>
