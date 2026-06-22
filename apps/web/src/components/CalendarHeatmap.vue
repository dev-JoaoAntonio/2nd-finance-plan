<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/utils/format';
import Icon from './Icon.vue';

const props = defineProps<{ month: string; daily: Record<string, number> }>();

const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const todayIso = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const max = computed(() =>
  Math.max(1, ...Object.values(props.daily).map((v) => v || 0)),
);

interface Cell {
  iso: string;
  day: number;
  value: number;
}

const cells = computed<(Cell | null)[]>(() => {
  const [y, m] = props.month.split('-').map(Number);
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const out: (Cell | null)[] = [];
  for (let i = 0; i < firstDow; i++) out.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    out.push({ iso, day: d, value: props.daily[iso] ?? 0 });
  }
  return out;
});

function cellClass(c: Cell): string {
  const r = c.value / max.value;
  if (c.value <= 0) return 'bg-ink-100';
  if (r > 0.8) return 'bg-pink-500';
  if (r > 0.6) return 'bg-pink-400';
  if (r > 0.4) return 'bg-pink-300';
  return 'bg-pink-200';
}
</script>

<template>
  <div class="card p-5">
    <div class="flex items-center justify-between">
      <div class="section-tag">
        <Icon name="dashboard" :size="14" class="text-pink-500" />
        Gastos por dia
      </div>
      <div class="flex items-center gap-1 text-[11px] text-ink-400">
        <span>menos</span>
        <span class="h-3 w-3 rounded bg-ink-100" />
        <span class="h-3 w-3 rounded bg-pink-200" />
        <span class="h-3 w-3 rounded bg-pink-300" />
        <span class="h-3 w-3 rounded bg-pink-400" />
        <span class="h-3 w-3 rounded bg-pink-500" />
        <span>mais</span>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-7 gap-1.5">
      <div
        v-for="(w, i) in WEEK"
        :key="`w${i}`"
        class="text-center text-[11px] font-semibold text-ink-400"
      >
        {{ w }}
      </div>
      <div
        v-for="(c, i) in cells"
        :key="`c${i}`"
        class="aspect-square rounded-md"
        :class="
          c
            ? [cellClass(c), c.iso === todayIso ? 'ring-2 ring-sky-500 ring-offset-1' : '']
            : 'bg-transparent'
        "
        :title="c ? `${c.iso} — ${formatCurrency(c.value)}` : ''"
      />
    </div>
  </div>
</template>
