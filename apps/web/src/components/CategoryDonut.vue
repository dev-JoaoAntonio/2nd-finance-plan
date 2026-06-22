<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import '@/utils/chart';
import { tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';
import type { CategorySummary } from '@/types';

const props = defineProps<{
  summary: CategorySummary[];
  details?: Record<string, { label: string; amount: number }[]>;
}>();
const emit = defineEmits<{ select: [CategorySummary] }>();

const chartData = computed<any>(() => ({
  labels: props.summary.map((s) => s.name),
  datasets: [
    {
      data: props.summary.map((s) => s.total),
      backgroundColor: props.summary.map((s) => s.color || '#94a3b8'),
      borderColor: '#fbfaf5',
      borderWidth: 2,
    },
  ],
}));

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  onClick: (_e: any, els: any[]) => {
    if (els.length) emit('select', props.summary[els[0].index]);
  },
  onHover: (e: any, els: any[]) => {
    if (e?.native?.target) e.native.target.style.cursor = els.length ? 'pointer' : 'default';
  },
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: 'Poppins' } } },
    tooltip: {
      ...tooltipTheme,
      callbacks: {
        title: (items: any[]) => items[0]?.label ?? '',
        label: (c: any) => ` ${formatCurrency(c.parsed)}`,
        afterBody: (items: any[]) => {
          const name = items[0]?.label;
          const list = props.details?.[name] ?? [];
          return list
            .slice(0, 5)
            .map((d) => `${d.label}: ${formatCurrency(d.amount)}`);
        },
      },
    },
  },
}));
</script>

<template>
  <div v-if="summary.length" class="relative h-[280px]">
    <Doughnut :data="chartData" :options="options" />
  </div>
  <div v-else class="flex h-[280px] items-center justify-center text-sm text-ink-400">
    Sem transações neste mês ainda.
  </div>
</template>
