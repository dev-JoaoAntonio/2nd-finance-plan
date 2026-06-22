<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';
import Icon from './Icon.vue';

const props = defineProps<{
  projection: number | null;
  income: number;
  totalSpent: number;
}>();

const pace = computed(() =>
  props.income > 0 ? props.totalSpent / props.income : 0,
);
const barColor = computed(() =>
  pace.value > 1 ? 'bg-rose-500' : pace.value > 0.85 ? 'bg-amber-500' : 'bg-emerald-500',
);
const barWidth = computed(() => `${Math.min(100, Math.max(0, pace.value * 100))}%`);

const verdict = computed(() => {
  if (props.projection === null) return 'Sem dados suficientes para projetar este mês.';
  if (props.income <= 0) return 'Defina sua renda para ver a projeção.';
  if (props.projection > props.income)
    return 'No ritmo atual, os gastos passam da renda no fim do mês.';
  if (props.projection > props.income * 0.9)
    return 'Projeção perto do limite da renda — atenção.';
  return 'Projeção dentro da renda. Bom ritmo! 👍';
});
</script>

<template>
  <div class="card h-full p-5">
    <div class="section-tag">
      <Icon name="trending" :size="14" class="text-sky-600" />
      Projeção do mês
    </div>
    <div class="mt-3 font-mono text-3xl font-extrabold text-ink-900">
      {{ projection === null ? '—' : formatCurrency(projection) }}
    </div>
    <p class="mt-2 text-sm text-ink-600">{{ verdict }}</p>
    <div class="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
      <div class="h-full transition-all duration-700" :class="barColor" :style="{ width: barWidth }" />
    </div>
    <div class="mt-1.5 flex justify-between text-[11px] font-semibold text-ink-400">
      <span>{{ formatCurrency(totalSpent) }} gastos</span>
      <span>{{ formatCurrency(income) }} renda</span>
    </div>
  </div>
</template>
