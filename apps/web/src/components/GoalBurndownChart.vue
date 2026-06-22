<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import '@/utils/chart';
import { axisTheme, tooltipTheme } from '@/utils/chart';
import { formatCurrency } from '@/utils/format';
import type { GoalContribution } from '@/types';

const props = defineProps<{
  contributions: GoalContribution[];
  saved: number;
  target: number;
  targetDate?: string | null;
}>();

const NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function lbl(key: string) {
  const [y, m] = key.split('-');
  return `${NAMES[Number(m) - 1]}/${y.slice(2)}`;
}
function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}
function addMonths(key: string, n: number) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(Date.UTC(y, m - 1 + n, 1)));
}
function diffMonths(a: string, b: string) {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + (bm - am);
}

const nowKey = monthKey(new Date());
const remaining = computed(() => Math.max(0, props.target - props.saved));
const monthsUntilTarget = computed(() =>
  props.targetDate ? Math.max(1, diffMonths(nowKey, addMonths(props.targetDate.slice(0, 7) + '-01', 0))) : 0,
);
const avgPace = computed(() => {
  const last = props.contributions.slice(0, 3);
  if (!last.length) return 0;
  return last.reduce((a, c) => a + c.amount, 0) / last.length;
});
const idealPace = computed(() =>
  monthsUntilTarget.value > 0 ? remaining.value / monthsUntilTarget.value : remaining.value,
);
const etaMonths = computed(() =>
  avgPace.value > 0 ? Math.ceil(remaining.value / avgPace.value) : Infinity,
);
const onTrack = computed(() => avgPace.value >= idealPace.value && avgPace.value > 0);
const statusText = computed(() => {
  if (remaining.value <= 0) return 'Meta atingida! 🎉';
  if (avgPace.value <= 0) return 'Registre aportes para ver a trajetória.';
  return onTrack.value
    ? 'No ritmo atual, você bate a meta dentro do prazo.'
    : 'Abaixo do ritmo necessário para o prazo.';
});

const timeline = computed(() => {
  const sorted = [...props.contributions].sort((a, b) =>
    a.referenceDate.localeCompare(b.referenceDate),
  );
  const startKey = sorted.length ? sorted[0].referenceDate : nowKey;
  const targetKey = props.targetDate ? props.targetDate.slice(0, 7) + '-01' : null;
  let endKey = nowKey;
  if (targetKey && diffMonths(nowKey, targetKey) > 0) endKey = targetKey;
  if (etaMonths.value !== Infinity)
    endKey =
      diffMonths(startKey, addMonths(nowKey, etaMonths.value)) > diffMonths(startKey, endKey)
        ? addMonths(nowKey, etaMonths.value)
        : endKey;
  const span = Math.min(24, Math.max(2, diffMonths(startKey, endKey)));
  const keys: string[] = [];
  for (let i = 0; i <= span; i++) keys.push(addMonths(startKey, i));
  return { keys, startKey, targetKey };
});

const chartData = computed<any>(() => {
  const { keys, targetKey } = timeline.value;
  const cumByMonth = new Map<string, number>();
  let acc = 0;
  for (const c of [...props.contributions].sort((a, b) =>
    a.referenceDate.localeCompare(b.referenceDate),
  )) {
    acc += c.amount;
    cumByMonth.set(c.referenceDate, acc);
  }
  const real: (number | null)[] = [];
  let running = 0;
  for (const k of keys) {
    if (cumByMonth.has(k)) running = cumByMonth.get(k)!;
    real.push(diffMonths(k, nowKey) >= 0 ? running : null);
  }
  // Projeção (ritmo atual) a partir de agora
  const projection = keys.map((k) => {
    const d = diffMonths(nowKey, k);
    if (d < 0) return null;
    return Math.min(props.target || Infinity, props.saved + avgPace.value * d);
  });
  // Ritmo ideal (linear até a meta)
  const ideal = keys.map((k) => {
    if (!targetKey) return null;
    const total = diffMonths(nowKey, targetKey) || 1;
    const d = diffMonths(nowKey, k);
    if (d < 0) return null;
    return Math.min(props.target, props.saved + (remaining.value / total) * d);
  });
  const meta = keys.map(() => props.target);

  return {
    labels: keys.map(lbl),
    datasets: [
      {
        label: 'Acumulado real',
        data: real,
        borderColor: '#3e6b4f',
        backgroundColor: '#3e6b4f22',
        fill: true,
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: 'Projeção (ritmo atual)',
        data: projection,
        borderColor: '#9c7350',
        borderDash: [6, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: 'Ritmo ideal',
        data: ideal,
        borderColor: '#10b981',
        borderDash: [4, 4],
        fill: false,
        tension: 0,
        pointRadius: 0,
      },
      {
        label: 'Meta',
        data: meta,
        borderColor: '#94a3b8',
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      },
    ],
  };
});

const options = computed<any>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: 'index' },
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: 'Poppins' }, boxWidth: 12 } },
    tooltip: {
      ...tooltipTheme,
      callbacks: {
        label: (c: any) =>
          c.parsed.y == null ? '' : ` ${c.dataset.label}: ${formatCurrency(c.parsed.y)}`,
      },
    },
  },
  scales: { x: axisTheme.x, y: axisTheme.y },
}));
</script>

<template>
  <div class="card p-5">
    <div class="flex flex-wrap items-center gap-2">
      <div class="section-tag">
        <span class="material-symbols-rounded text-sky-600" style="font-size: 14px">timeline</span>
        Trajetória da meta
      </div>
      <div class="ml-auto flex flex-wrap gap-2 text-[11px] font-semibold">
        <span class="rounded-md bg-sky-50 px-2 py-1 text-sky-700">Alvo {{ formatCurrency(target) }}</span>
        <span class="rounded-md bg-pink-50 px-2 py-1 text-pink-700">Ritmo médio {{ formatCurrency(avgPace) }}/mês</span>
        <span class="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">Ideal {{ formatCurrency(idealPace) }}/mês</span>
      </div>
    </div>

    <div class="relative mt-4 h-[280px]">
      <Line :data="chartData" :options="options" />
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3 text-center">
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Faltam</div>
        <div class="font-mono text-sm font-bold text-ink-800">{{ formatCurrency(remaining) }}</div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">ETA</div>
        <div class="font-mono text-sm font-bold text-ink-800">
          {{ etaMonths === Infinity ? '—' : `${etaMonths} mes(es)` }}
        </div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Aportes</div>
        <div class="font-mono text-sm font-bold text-ink-800">{{ contributions.length }}</div>
      </div>
    </div>
    <p class="mt-3 text-center text-sm font-medium" :class="onTrack ? 'text-emerald-600' : 'text-ink-500'">
      {{ statusText }}
    </p>
  </div>
</template>
