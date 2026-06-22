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

const chartData = computed<any>(() => ({
  labels: props.history.map((h) => label(h.month)),
  datasets: [
    {
      label: 'Renda',
      data: props.history.map((h) => h.income),
      backgroundColor: '#10b981',
      borderRadius: 6,
      maxBarThickness: 22,
    },
    {
      label: 'Gasto total',
      data: props.history.map((h) => h.fixed + h.transactions),
      backgroundColor: '#9c7350',
      borderRadius: 6,
      maxBarThickness: 22,
    },
  ],
}));

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: 'Poppins' } } },
    tooltip: {
      ...tooltipTheme,
      callbacks: {
        label: (c: any) => ` ${c.dataset.label}: ${formatCurrency(c.parsed.y)}`,
        afterBody: (items: any[]) => {
          const h = props.history[items[0].dataIndex];
          const net = h.income - h.fixed - h.transactions;
          return [`Líquido: ${formatCurrency(net)}`];
        },
      },
    },
  },
  scales: { x: axisTheme.x, y: axisTheme.y },
}));
</script>

<template>
  <div class="relative h-[280px]">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
