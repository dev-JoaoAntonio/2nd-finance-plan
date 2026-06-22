<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import '@/utils/chart';
import { axisTheme, tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';
import type { MonthlyTotal } from '@/types';

const props = withDefaults(
  defineProps<{ history: MonthlyTotal[]; mode?: 'transactions' | 'all' }>(),
  { mode: 'transactions' },
);

function label(month: string): string {
  const [y, m] = month.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${names[Number(m) - 1]}/${y.slice(2)}`;
}

const chartData = computed<any>(() => {
  const labels = props.history.map((h) => label(h.month));
  if (props.mode === 'all') {
    return {
      labels,
      datasets: [
        {
          label: 'Transações',
          data: props.history.map((h) => h.transactions),
          backgroundColor: '#3e6b4f',
          borderRadius: 6,
          maxBarThickness: 28,
          stack: 's',
        },
        {
          label: 'Passivos Fixos',
          data: props.history.map((h) => h.fixed),
          backgroundColor: '#9c7350',
          borderRadius: 6,
          maxBarThickness: 28,
          stack: 's',
        },
      ],
    };
  }
  return {
    labels,
    datasets: [
      {
        label: 'Transações',
        data: props.history.map((h) => h.transactions),
        backgroundColor: '#3e6b4f',
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };
});

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: props.mode === 'all', labels: { font: { family: 'Poppins' } } },
    tooltip: {
      ...tooltipTheme,
      callbacks: { label: (c: any) => ` ${c.dataset.label}: ${formatCurrency(c.parsed.y)}` },
    },
  },
  scales: {
    x: { ...axisTheme.x, stacked: props.mode === 'all' },
    y: { ...axisTheme.y, stacked: props.mode === 'all' },
  },
}));
</script>

<template>
  <div class="relative h-[280px]">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
