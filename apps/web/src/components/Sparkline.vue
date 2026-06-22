<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ data: number[]; color?: string; height?: number }>(),
  { color: 'rgba(255,255,255,0.85)', height: 32 },
);

let _id = 0;
const gradId = `spark-${(_id = Math.floor(Math.random() * 1e9))}`;

const W = 100;
const H = 36;
const PAD = 2;

const points = computed(() => {
  const d = props.data;
  if (!d || d.length < 2) return [];
  const min = Math.min(...d);
  const max = Math.max(...d);
  const range = max - min || 1;
  const step = (W - PAD * 2) / (d.length - 1);
  return d.map((v, i) => {
    const x = PAD + i * step;
    const y = PAD + (H - PAD * 2) * (1 - (v - min) / range);
    return [x, y] as [number, number];
  });
});

const linePath = computed(() =>
  points.value.length
    ? points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
    : '',
);
const areaPath = computed(() => {
  if (!points.value.length) return '';
  const last = points.value[points.value.length - 1];
  return `${linePath.value} L${last[0]},${H} L${points.value[0][0]},${H} Z`;
});
</script>

<template>
  <svg
    v-if="points.length"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="none"
    :height="height"
    class="w-full"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="color" stop-opacity="0.35" />
        <stop offset="1" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="areaPath" :fill="`url(#${gradId})`" />
    <path
      :d="linePath"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
