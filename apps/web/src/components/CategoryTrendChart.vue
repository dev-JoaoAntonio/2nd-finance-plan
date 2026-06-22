<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import '@/utils/chart';
import { axisTheme, tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';
import type { MonthlyTotal } from '@/types';

const props = withDefaults(
  defineProps<{
    history: MonthlyTotal[];
    categoryName: string;
    color?: string;
  }>(),
  { color: '#3e6b4f' },
);

function label(month: string): string {
  const [y, m] = month.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${names[Number(m) - 1]}/${y.slice(2)}`;
}

const series = computed(() =>
  props.history.map(
    (h) =>
      h.transactionsBreakdown.find((b) => b.name === props.categoryName)?.total ?? 0,
  ),
);

const chartData = computed<any>(() => ({
  labels: props.history.map((h) => label(h.month)),
  datasets: [
    {
      label: props.categoryName,
      data: series.value,
      borderColor: props.color,
      backgroundColor: `${props.color}22`,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
    },
  ],
}));

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      ...tooltipTheme,
      callbacks: { label: (c: any) => ` ${formatCurrency(c.parsed.y)}` },
    },
  },
  scales: { x: axisTheme.x, y: axisTheme.y },
}));
</script>

<template>
  <div class="relative h-[220px]">
    <Line :data="chartData" :options="options" />
  </div>
</template>
