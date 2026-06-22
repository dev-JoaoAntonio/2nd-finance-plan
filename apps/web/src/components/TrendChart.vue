<template>
  <apexchart type="area" :height="height" :options="options" :series="chartSeries" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency, formatMonthShort, formatMonthLabel } from '@/lib/format';
import { activeBrand } from '@/brands';
import type { TrendPoint } from '@/lib/types';

const props = withDefaults(
  defineProps<{ data: TrendPoint[]; height?: number }>(),
  { height: 300 },
);

const chartSeries = computed(() => [
  { name: 'Gasto no mês', data: props.data.map((d) => Math.round(d.total * 100) / 100) },
]);

const options = computed(() => ({
  chart: {
    fontFamily: 'Atkinson Hyperlegible, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: [activeBrand.colors.primary],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.3, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  markers: { size: 5, strokeWidth: 2, hover: { size: 7 } },
  dataLabels: { enabled: false },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
  xaxis: {
    categories: props.data.map((d) => formatMonthShort(d.month)),
    labels: { style: { fontSize: '14px', fontWeight: 600, colors: '#475569' } },
    axisBorder: { color: '#cbd5e1' },
    axisTicks: { color: '#cbd5e1' },
  },
  yaxis: {
    labels: {
      style: { fontSize: '13px', colors: '#475569' },
      formatter: (val: number) => formatCurrency(val),
    },
  },
  tooltip: {
    style: { fontSize: '15px' },
    x: { formatter: (_v: number, opts: { dataPointIndex: number }) => formatMonthLabel(props.data[opts.dataPointIndex]?.month ?? '') },
    y: { formatter: (val: number) => formatCurrency(val) },
  },
}));
</script>
