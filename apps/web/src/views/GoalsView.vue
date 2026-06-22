<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { LONG_TERM_TITLE, useFinanceStore } from '@/stores/finance';
import { useToastStore } from '@/stores/toast';
import { formatCurrency, formatMonthLabel, parseInput } from '@/utils/format';
import ProgressBar from '@/components/ProgressBar.vue';
import Segmented from '@/components/Segmented.vue';
import DatePicker from '@/components/DatePicker.vue';
import GoalBurndownChart from '@/components/GoalBurndownChart.vue';
import GoalSimulationCard from '@/components/GoalSimulationCard.vue';
import GoalModal from '@/components/GoalModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import Icon from '@/components/Icon.vue';
import type { Goal } from '@/types';

const finance = useFinanceStore();
const toast = useToastStore();
const { longTermGoal, longTerm, longTermPct, achievements, goalContributions } =
  storeToRefs(finance);

const goalTitle = computed(() => longTermGoal.value?.title ?? LONG_TERM_TITLE);

const todayIso = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const remaining = computed(() => Math.max(0, longTerm.value.target - longTerm.value.saved));
const monthsToTarget = computed(() => {
  if (!longTerm.value.targetDate) return null;
  const [ty, tm] = longTerm.value.targetDate.split('-').map(Number);
  const now = new Date();
  return Math.max(0, (ty - now.getFullYear()) * 12 + (tm - 1 - now.getMonth()));
});

// ── Tabs ──
const goalTab = ref<'values' | 'date' | 'contributions'>('values');
const tabOptions = [
  { value: 'values', label: 'Valores' },
  { value: 'date', label: 'Data alvo' },
  { value: 'contributions', label: 'Aportes' },
] as const;

const savedText = ref('');
const targetText = ref('');
function syncValueInputs() {
  savedText.value = longTerm.value.saved.toFixed(2).replace('.', ',');
  targetText.value = longTerm.value.target.toFixed(2).replace('.', ',');
}
syncValueInputs();

async function commitSaved() {
  await finance.updateLongTerm({ saved: parseInput(savedText.value) });
  toast.success('Valor alocado atualizado.');
}
async function commitTarget() {
  await finance.updateLongTerm({ target: parseInput(targetText.value) });
  toast.success('Meta atualizada.');
}
async function commitDate(date: string | null) {
  await finance.updateLongTerm({ targetDate: date });
  toast.success('Data alvo atualizada.');
}

// ── Aportes ──
const contribMonth = ref<string | null>(todayIso.slice(0, 8) + '01');
const contribAmount = ref('');
const sortedContributions = computed(() =>
  [...goalContributions.value].sort((a, b) => b.referenceDate.localeCompare(a.referenceDate)),
);
async function saveContribution() {
  if (!contribMonth.value) return;
  const amount = parseInput(contribAmount.value);
  if (amount <= 0) {
    toast.error('Informe o valor do aporte.');
    return;
  }
  await finance.saveContribution(contribMonth.value, amount);
  contribAmount.value = '';
  toast.success('Aporte salvo.');
}
function editContribution(c: { referenceDate: string; amount: number }) {
  contribMonth.value = c.referenceDate;
  contribAmount.value = c.amount.toFixed(2).replace('.', ',');
}
async function removeContribution(referenceDate: string) {
  await finance.deleteContribution(referenceDate);
  toast.success('Aporte removido.');
}

// ── Conquistas ──
const showGoalModal = ref(false);
const saving = ref(false);
const toDelete = ref<Goal | null>(null);

const achievementsPct = computed(() => {
  if (!achievements.value.length) return 0;
  const done = achievements.value.filter((a) => a.isCompleted).length;
  return (done / achievements.value.length) * 100;
});
const doneCount = computed(() => achievements.value.filter((a) => a.isCompleted).length);
const sortedAchievements = computed(() =>
  [...achievements.value].sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)),
);

async function addAchievement(title: string) {
  saving.value = true;
  try {
    await finance.addAchievement(title);
    showGoalModal.value = false;
    toast.success('Conquista adicionada.');
  } finally {
    saving.value = false;
  }
}
async function toggle(a: Goal) {
  await finance.toggleAchievement(a);
}
async function confirmDelete() {
  if (!toDelete.value) return;
  saving.value = true;
  try {
    await finance.deleteGoal(toDelete.value.id);
    toDelete.value = null;
    toast.success('Conquista removida.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Meta de longo prazo -->
      <div class="card overflow-hidden" v-reveal>
        <div class="goal-hero relative p-6 text-white">
          <div class="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div class="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-white/10" />
          <div class="relative">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="grid h-9 w-9 place-content-center rounded-xl bg-white/20">
                  <Icon name="target" :size="20" />
                </div>
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-wider text-white/80">Projeto</div>
                  <div class="text-lg font-bold">{{ goalTitle }}</div>
                </div>
              </div>
              <span class="rounded-full bg-white/20 px-3 py-1 text-sm font-bold">
                {{ longTermPct.toFixed(1) }}%
              </span>
            </div>
            <div class="mt-4 font-mono text-2xl font-extrabold">
              {{ formatCurrency(longTerm.saved) }}
              <span class="text-base font-medium text-white/80">de {{ formatCurrency(longTerm.target) }}</span>
            </div>
            <div v-if="longTerm.targetDate" class="text-xs text-white/80">
              · até {{ formatMonthLabel(longTerm.targetDate.slice(0, 7) + '-01') }}
            </div>
            <div class="mt-3 h-2.5 overflow-hidden rounded-full bg-white/25">
              <div class="h-full rounded-full bg-white transition-all duration-700" :style="{ width: `${longTermPct}%` }" />
            </div>
            <div class="mt-2 flex justify-between text-[11px] text-white/80">
              <span>{{ goalContributions.length }} aporte(s)</span>
              <span>{{ formatCurrency(remaining) }} restante</span>
            </div>
          </div>
        </div>

        <div class="p-5">
          <Segmented v-model="goalTab" :options="tabOptions" />

          <div v-if="goalTab === 'values'" class="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label">Valor alocado (R$)</label>
              <input v-model="savedText" class="input font-mono" inputmode="decimal" @blur="commitSaved" />
            </div>
            <div>
              <label class="label">Meta (R$)</label>
              <input v-model="targetText" class="input font-mono" inputmode="decimal" @blur="commitTarget" />
            </div>
          </div>

          <div v-else-if="goalTab === 'date'" class="mt-4">
            <label class="label">Data alvo</label>
            <DatePicker :model-value="longTerm.targetDate" :min="todayIso" @change="commitDate" />
            <p v-if="monthsToTarget !== null" class="mt-2 text-sm text-ink-500">
              Faltam {{ monthsToTarget }} mes(es) até o alvo.
            </p>
          </div>

          <div v-else class="mt-4 space-y-4">
            <div class="flex flex-wrap items-end gap-2">
              <div class="flex-1">
                <label class="label">Mês</label>
                <DatePicker v-model="contribMonth" />
              </div>
              <div class="w-32">
                <label class="label">Valor</label>
                <input v-model="contribAmount" class="input font-mono" inputmode="decimal" placeholder="0,00" />
              </div>
              <button class="btn-primary" @click="saveContribution">Salvar</button>
            </div>
            <ul class="space-y-2">
              <li
                v-for="c in sortedContributions"
                :key="c.id"
                class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2"
              >
                <span class="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-ink-500">
                  {{ formatMonthLabel(c.referenceDate.slice(0, 7) + '-01') }}
                </span>
                <button class="flex-1 text-left font-mono text-sm font-bold text-emerald-700" @click="editContribution(c)">
                  {{ formatCurrency(c.amount) }}
                </button>
                <button class="opacity-0 transition group-hover:opacity-100" @click="removeContribution(c.referenceDate)">
                  <Icon name="trash" :size="16" class="text-rose-600" />
                </button>
              </li>
              <li v-if="!sortedContributions.length" class="py-4 text-center text-sm text-ink-400">
                Nenhum aporte ainda.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Conquistas -->
      <div class="card overflow-hidden" v-reveal="{ delay: 80 }">
        <div class="flex items-center gap-3 bg-gradient-to-r from-sky-500 to-pink-500 px-5 py-4 text-white">
          <div class="grid h-10 w-10 place-content-center rounded-xl bg-white/20">
            <Icon name="target" :size="22" />
          </div>
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wider text-white/80">Marcos da jornada</div>
            <div class="text-lg font-bold">Conquistas</div>
          </div>
          <button class="btn ml-auto bg-white/20 text-white hover:bg-white/30 !py-1.5" @click="showGoalModal = true">
            <Icon name="plus" :size="16" /> Nova
          </button>
        </div>

        <div class="p-5">
          <div class="mb-1 flex justify-between text-xs font-semibold text-ink-500">
            <span>{{ doneCount }}/{{ achievements.length }} concluídas</span>
            <span>{{ Math.round(achievementsPct) }}%</span>
          </div>
          <div class="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full rounded-full bg-gradient-to-r from-sky-500 to-pink-500 transition-all duration-700" :style="{ width: `${achievementsPct}%` }" />
          </div>

          <TransitionGroup name="ach-list" tag="ul" class="space-y-2">
            <li
              v-for="a in sortedAchievements"
              :key="a.id"
              class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5"
            >
              <button
                class="grid h-6 w-6 shrink-0 place-content-center rounded-full border-2 transition"
                :class="a.isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-ink-300'"
                @click="toggle(a)"
              >
                <Icon v-if="a.isCompleted" name="check" :size="14" />
              </button>
              <span class="flex-1 text-sm font-medium" :class="a.isCompleted ? 'text-ink-400 line-through' : 'text-ink-800'">
                {{ a.title }}
              </span>
              <button class="opacity-0 transition group-hover:opacity-100" @click="toDelete = a">
                <Icon name="trash" :size="16" class="text-rose-600" />
              </button>
            </li>
          </TransitionGroup>

          <div v-if="!achievements.length" class="py-8 text-center">
            <Icon name="target" :size="40" class="text-ink-300" />
            <p class="mt-2 text-sm text-ink-400">Sem conquistas ainda</p>
            <button class="btn-primary mt-3" @click="showGoalModal = true">Adicionar primeira</button>
          </div>
        </div>
      </div>
    </div>

    <GoalBurndownChart
      :contributions="goalContributions"
      :saved="longTerm.saved"
      :target="longTerm.target"
      :target-date="longTerm.targetDate"
    />
    <GoalSimulationCard
      :saved="longTerm.saved"
      :target="longTerm.target"
      :target-date="longTerm.targetDate"
    />

    <GoalModal :open="showGoalModal" :loading="saving" @close="showGoalModal = false" @save="addAchievement" />
    <ConfirmModal
      :open="!!toDelete"
      title="Remover conquista?"
      :loading="saving"
      @close="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.goal-hero {
  background: linear-gradient(135deg, #3e6b4f 0%, #5f9070 35%, #9c7350 100%);
}
.ach-list-enter-active,
.ach-list-leave-active {
  transition: all 0.3s ease;
}
.ach-list-enter-from,
.ach-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
