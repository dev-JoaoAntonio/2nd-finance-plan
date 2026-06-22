<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '@/stores/finance';
import StatCard from '@/components/StatCard.vue';
import ProjectionCard from '@/components/ProjectionCard.vue';
import InsightsCard from '@/components/InsightsCard.vue';
import TopTransactionsCard from '@/components/TopTransactionsCard.vue';
import Segmented from '@/components/Segmented.vue';
import CategoryDonut from '@/components/CategoryDonut.vue';
import CategoryTrendChart from '@/components/CategoryTrendChart.vue';
import MonthlyBarChart from '@/components/MonthlyBarChart.vue';
import IncomeVsExpenseChart from '@/components/IncomeVsExpenseChart.vue';
import NetBalanceChart from '@/components/NetBalanceChart.vue';
import CalendarHeatmap from '@/components/CalendarHeatmap.vue';
import Skeleton from '@/components/Skeleton.vue';
import Icon from '@/components/Icon.vue';
import { formatCurrency } from '@/utils/format';
import type { CategorySummary } from '@/types';

const finance = useFinanceStore();
const {
  loading,
  initialized,
  fixedPlanned,
  fixedSpent,
  transactionsTotal,
  available,
  savingsRate,
  projection,
  income,
  totalSpent,
  insights,
  topTransactions,
  summary,
  transactions,
  monthlyHistory,
  dailyMap,
  currentMonth,
  fixedSpentDelta,
  transactionsDelta,
  totalSpentDelta,
  savingsRateDelta,
  sparkFixed,
  sparkTx,
  sparkAvailable,
  sparkSavings,
} = storeToRefs(finance);

const isLoading = computed(() => loading.value || !initialized.value);

const donutMode = ref<'transactions' | 'all'>('transactions');
const barMode = ref<'transactions' | 'all'>('transactions');
const modeOptions = [
  { value: 'transactions', label: 'Transações' },
  { value: 'all', label: 'Geral' },
] as const;

const donutSummary = computed<CategorySummary[]>(() => {
  if (donutMode.value === 'all' && fixedSpent.value > 0) {
    return [
      ...summary.value,
      {
        id: '_fixed_',
        name: 'Passivos Fixos',
        color: '#9c7350',
        total: fixedSpent.value,
        count: 0,
      },
    ];
  }
  return summary.value;
});

const donutDetails = computed(() => {
  const map: Record<string, { label: string; amount: number }[]> = {};
  for (const t of transactions.value) {
    const name = t.category?.name ?? 'Sem categoria';
    (map[name] ??= []).push({
      label: t.description || '(sem descrição)',
      amount: t.amount,
    });
  }
  for (const k of Object.keys(map)) map[k].sort((a, b) => b.amount - a.amount);
  return map;
});

const selectedCategory = ref<{ name: string; color: string } | null>(null);
function onSelect(cat: CategorySummary) {
  if (cat.id === '_fixed_') return;
  selectedCategory.value = { name: cat.name, color: cat.color ?? '#3e6b4f' };
}
</script>

<template>
  <div v-if="isLoading" class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="i in 4" :key="i" class="h-36" />
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <Skeleton v-for="i in 3" :key="i" class="h-56" />
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <Skeleton class="h-80" />
      <Skeleton class="h-80" />
    </div>
  </div>

  <div v-else class="space-y-6">
    <!-- KPIs -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-reveal>
        <StatCard
          label="Custos Fixos"
          :value="fixedPlanned"
          :hint="`${formatCurrency(fixedSpent)} gasto`"
          accent="pink"
          :delta="fixedSpentDelta"
          inverse-delta
          :spark="sparkFixed"
        />
      </div>
      <div v-reveal="{ delay: 70 }">
        <StatCard
          label="Transações do mês"
          :value="transactionsTotal"
          :hint="`${transactions.length} lançamento(s)`"
          accent="sky"
          :delta="transactionsDelta"
          inverse-delta
          :spark="sparkTx"
        />
      </div>
      <div v-reveal="{ delay: 140 }">
        <StatCard
          label="Saldo Atual"
          :value="available"
          hint="Renda menos gastos do mês"
          accent="neutral"
          :delta="totalSpentDelta"
          inverse-delta
          :spark="sparkAvailable"
        />
      </div>
      <div v-reveal="{ delay: 210 }">
        <StatCard
          label="Taxa de poupança"
          :value="savingsRate"
          format="percent"
          hint="(Renda − Gastos) / Renda"
          accent="emerald"
          :delta="savingsRateDelta"
          delta-as-pp
          :spark="sparkSavings"
        />
      </div>
    </div>

    <!-- Projeção / Insights / Top-5 -->
    <div class="grid gap-4 lg:grid-cols-3">
      <ProjectionCard :projection="projection" :income="income" :total-spent="totalSpent" />
      <InsightsCard :insights="insights" />
      <TopTransactionsCard :items="topTransactions" />
    </div>

    <!-- Categoria / Histórico -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <div class="section-tag">Gastos por categoria</div>
          <Segmented v-model="donutMode" :options="modeOptions" />
        </div>
        <CategoryDonut :summary="donutSummary" :details="donutDetails" @select="onSelect" />
        <div v-if="selectedCategory" class="mt-3 border-t border-ink-200 pt-3">
          <div class="mb-1 flex items-center justify-between">
            <span class="text-sm font-semibold text-ink-700">{{ selectedCategory.name }} — 12 meses</span>
            <button class="text-xs text-ink-400 hover:underline" @click="selectedCategory = null">fechar</button>
          </div>
          <CategoryTrendChart
            :history="monthlyHistory"
            :category-name="selectedCategory.name"
            :color="selectedCategory.color"
          />
        </div>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between">
          <div class="section-tag">Histórico — últimos 12 meses</div>
          <Segmented v-model="barMode" :options="modeOptions" />
        </div>
        <div class="mt-3">
          <MonthlyBarChart :history="monthlyHistory" :mode="barMode" />
        </div>
      </div>
    </div>

    <!-- Renda × Gastos / Saldo líquido -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="card p-5">
        <div class="section-tag mb-3">
          <Icon name="trending" :size="14" class="text-emerald-600" />
          Renda × Gastos (12 meses)
        </div>
        <IncomeVsExpenseChart :history="monthlyHistory" />
      </div>
      <div class="card p-5">
        <div class="section-tag mb-3">Saldo líquido (12 meses)</div>
        <NetBalanceChart :history="monthlyHistory" />
      </div>
    </div>

    <!-- Heatmap -->
    <CalendarHeatmap :month="currentMonth" :daily="dailyMap" />
  </div>
</template>
