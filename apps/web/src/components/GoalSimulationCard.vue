<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import '@/utils/chart';
import { axisTheme, tooltipTheme } from '@/utils/chart';
import { formatCurrency, parseInput } from '@/utils/format';
import DatePicker from './DatePicker.vue';

const props = defineProps<{ saved: number; target: number; targetDate: string | null }>();

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

const startSaved = ref(props.saved);
const monthlyText = ref('0');
const endDate = ref<string | null>(props.targetDate);

watch(() => props.saved, (v) => (startSaved.value = v));
watch(() => props.targetDate, (v) => (endDate.value = v));

const monthly = computed(() => parseInput(monthlyText.value));
const months = computed(() =>
  endDate.value ? Math.max(1, diffMonths(nowKey, endDate.value.slice(0, 7) + '-01')) : 12,
);
const projectedTotal = computed(() => startSaved.value + monthly.value * months.value);
const diffVsTarget = computed(() => projectedTotal.value - props.target);
const monthlyToHitOnTime = computed(() =>
  months.value > 0 ? Math.max(0, (props.target - startSaved.value) / months.value) : 0,
);
const needsPhase2 = computed(() => projectedTotal.value < props.target - 0.01);

const chartData = computed<any>(() => {
  const keys: string[] = [];
  for (let i = 0; i <= months.value; i++) keys.push(addMonths(nowKey, i));
  const fase1 = keys.map((_, i) => startSaved.value + monthly.value * i);
  const fase2 = keys.map((_, i) => startSaved.value + monthlyToHitOnTime.value * i);
  return {
    labels: keys.map(lbl),
    datasets: [
      {
        label: 'Fase 1 (seu aporte)',
        data: fase1,
        borderColor: '#3e6b4f',
        backgroundColor: '#3e6b4f22',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      },
      ...(needsPhase2.value
        ? [
            {
              label: 'Fase 2 (necessário)',
              data: fase2,
              borderColor: '#9c7350',
              borderDash: [6, 4],
              fill: false,
              tension: 0.3,
              pointRadius: 0,
            },
          ]
        : []),
      {
        label: 'Meta',
        data: keys.map(() => props.target),
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
      callbacks: { label: (c: any) => ` ${c.dataset.label}: ${formatCurrency(c.parsed.y)}` },
    },
  },
  scales: { x: axisTheme.x, y: axisTheme.y },
}));

function useCurrent() {
  startSaved.value = props.saved;
}
function useSuggested() {
  monthlyText.value = monthlyToHitOnTime.value.toFixed(2).replace('.', ',');
}
</script>

<template>
  <div class="card p-5">
    <div class="section-tag">
      <span class="material-symbols-rounded text-sky-600" style="font-size: 14px">calculate</span>
      Simulação (não salva)
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <div>
        <label class="label flex items-center justify-between">
          Já temos (R$)
          <button class="text-sky-600 hover:underline" @click="useCurrent">usar atual</button>
        </label>
        <input
          class="input font-mono"
          inputmode="decimal"
          :value="startSaved.toFixed(2).replace('.', ',')"
          @change="(e: any) => (startSaved = parseInput(e.target.value))"
        />
      </div>
      <div>
        <label class="label">Aporte mensal (R$)</label>
        <input v-model="monthlyText" class="input font-mono" inputmode="decimal" placeholder="0,00" />
      </div>
      <div>
        <label class="label">Data final</label>
        <DatePicker v-model="endDate" />
      </div>
    </div>

    <div class="relative mt-4 h-[280px]">
      <Line :data="chartData" :options="options" />
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Meses</div>
        <div class="font-mono text-sm font-bold text-ink-800">{{ months }}</div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Projetado</div>
        <div class="font-mono text-sm font-bold text-ink-800">{{ formatCurrency(projectedTotal) }}</div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">vs Meta</div>
        <div
          class="font-mono text-sm font-bold"
          :class="diffVsTarget >= 0 ? 'text-emerald-600' : 'text-rose-600'"
        >
          {{ diffVsTarget >= 0 ? '+' : '' }}{{ formatCurrency(diffVsTarget) }}
        </div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-ink-400">P/ meta</div>
        <div class="font-mono text-sm font-bold text-ink-800">
          {{ formatCurrency(monthlyToHitOnTime) }}/mês
        </div>
      </div>
    </div>

    <button v-if="needsPhase2" class="btn-ghost mt-3 w-full" @click="useSuggested">
      Usar {{ formatCurrency(monthlyToHitOnTime) }}/mês
    </button>
  </div>
</template>
