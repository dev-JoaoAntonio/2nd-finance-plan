<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import '@/utils/chart';
import { axisTheme, tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';
import type { MonthlyTotal } from '@/types';

const props = defineProps<{ history: MonthlyTotal[] }>();

function label(month: string): string {
  const [y, m] = month.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${names[Number(m) - 1]}/${y.slice(2)}`;
}

const nets = computed(() =>
  props.history.map((h) => h.income - h.fixed - h.transactions),
);

const chartData = computed<any>(() => ({
  labels: props.history.map((h) => label(h.month)),
  datasets: [
    {
      label: 'Saldo líquido',
      data: nets.value,
      backgroundColor: nets.value.map((n) => (n >= 0 ? '#10b981' : '#e11d48')),
      borderRadius: 6,
      maxBarThickness: 28,
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
  scales: { x: axisTheme.x, y: { ...axisTheme.y, beginAtZero: false } },
}));
</script>

<template>
  <div class="relative h-[280px]">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
