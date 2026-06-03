<template>
  <div>
    <apexchart
      type="donut"
      :height="height"
      :options="options"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/lib/format';
import type { CategoryBreakdown } from '@/lib/types';

const props = withDefaults(
  defineProps<{ data: CategoryBreakdown[]; height?: number }>(),
  { height: 320 },
);

const series = computed(() => props.data.map((d) => Math.round(d.total * 100) / 100));

const options = computed(() => ({
  chart: {
    fontFamily: 'Atkinson Hyperlegible, sans-serif',
    animations: { enabled: true },
  },
  labels: props.data.map((d) => d.name),
  colors: props.data.map((d) => d.color),
  stroke: { width: 2, colors: ['#ffffff'] },
  dataLabels: {
    enabled: true,
    style: { fontSize: '15px', fontWeight: 700 },
    dropShadow: { enabled: false },
    formatter: (val: number) => `${Math.round(val)}%`,
  },
  legend: {
    position: 'bottom',
    fontSize: '15px',
    fontWeight: 600,
    markers: { width: 14, height: 14 },
    itemMargin: { horizontal: 10, vertical: 4 },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '62%',
        labels: {
          show: true,
          total: {
            show: true,
            showAlways: true,
            label: 'Total do mês',
            fontSize: '14px',
            fontWeight: 600,
            color: '#475569',
            formatter: () =>
              formatCurrency(props.data.reduce((acc, d) => acc + d.total, 0)),
          },
          value: { fontSize: '20px', fontWeight: 700, color: '#0f172a' },
        },
      },
    },
  },
  tooltip: {
    style: { fontSize: '15px' },
    y: { formatter: (val: number) => formatCurrency(val) },
  },
  responsive: [
    {
      breakpoint: 600,
      options: { legend: { position: 'bottom' } },
    },
  ],
}));
</script>
