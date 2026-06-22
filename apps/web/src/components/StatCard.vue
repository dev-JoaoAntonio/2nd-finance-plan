<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';
import Sparkline from './Sparkline.vue';

type Accent = 'sky' | 'pink' | 'neutral' | 'emerald';

const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    hint?: string;
    accent?: Accent;
    delta?: number | null;
    deltaAsPp?: boolean;
    inverseDelta?: boolean;
    spark?: number[];
    format?: 'currency' | 'percent';
  }>(),
  { accent: 'neutral', format: 'currency' },
);

const bgClass = computed(
  () =>
    ({
      sky: 'bg-sky-500',
      pink: 'bg-pink-500',
      emerald: 'bg-emerald-500',
      neutral: 'bg-ink-700',
    })[props.accent],
);

const valueText = computed(() =>
  props.format === 'percent'
    ? `${Math.round(props.value * 100)}%`
    : formatCurrency(props.value),
);

const hasDelta = computed(
  () => props.delta !== null && props.delta !== undefined,
);
const isUp = computed(() => (props.delta ?? 0) > 0);
const isFlat = computed(() => (props.delta ?? 0) === 0);
const isGood = computed(() =>
  props.inverseDelta ? !isUp.value : isUp.value,
);
const deltaText = computed(() => {
  const d = props.delta ?? 0;
  if (props.deltaAsPp) return `${d > 0 ? '+' : ''}${d.toFixed(1)} pp`;
  return `${Math.abs(d)}%`;
});
const arrowColor = computed(() =>
  isFlat.value ? 'text-white/70' : isGood.value ? 'text-emerald-200' : 'text-rose-200',
);
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl p-6 text-white shadow-card"
    :class="bgClass"
  >
    <div class="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
    <div class="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-white/10" />

    <div class="relative">
      <div class="text-[11px] font-semibold uppercase tracking-wider text-white/80">
        {{ label }}
      </div>
      <div class="mt-2 font-mono text-3xl font-extrabold sm:text-4xl">
        {{ valueText }}
      </div>

      <div class="mt-2 flex items-center gap-2">
        <span
          v-if="hasDelta"
          class="inline-flex items-center gap-1 rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-bold"
          :class="arrowColor"
        >
          <span v-if="!isFlat">{{ isUp ? '↑' : '↓' }}</span>
          {{ deltaText }}
        </span>
        <span v-if="hint" class="text-xs text-white/80">{{ hint }}</span>
      </div>

      <div v-if="spark && spark.length > 1" class="mt-3 -mb-1">
        <Sparkline :data="spark" />
      </div>
    </div>
  </div>
</template>
