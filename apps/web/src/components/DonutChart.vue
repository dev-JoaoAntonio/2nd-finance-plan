<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import '@/utils/chart';
import { tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';

const props = defineProps<{ fixed: number; variable: number; available: number }>();

const chartData = computed<any>(() => ({
  labels: ['Fixos', 'Variáveis', 'Sobra'],
  datasets: [
    {
      data: [props.fixed, props.variable, Math.max(0, props.available)],
      backgroundColor: ['#9c7350', '#3e6b4f', '#e3deca'],
      borderColor: '#fbfaf5',
      borderWidth: 2,
    },
  ],
}));

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '64%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: 'Poppins' } } },
    tooltip: {
      ...tooltipTheme,
      callbacks: { label: (c: any) => ` ${formatCurrency(c.parsed)}` },
    },
  },
}));
</script>

<template>
  <div class="relative h-[280px]">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
