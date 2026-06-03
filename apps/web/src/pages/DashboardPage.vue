<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <!-- Cabeçalho da página -->
    <div class="row items-center justify-between q-mb-lg q-gutter-y-md">
      <div>
        <div class="fp-page-title">Olá, {{ firstName }} 👋</div>
        <div class="fp-muted" style="font-size: 1.05rem">
          Veja um resumo dos seus gastos.
        </div>
      </div>
      <month-selector :model-value="dashboard.month" @update:model-value="dashboard.setMonth" />
    </div>

    <q-inner-loading :showing="dashboard.loading" color="primary" />

    <template v-if="!dashboard.loading">
      <!-- Cartões de resumo -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <stat-card
            label="Total gasto no mês"
            :value="formatCurrency(summary?.total ?? 0)"
            icon="account_balance_wallet"
            color="#0369A1"
            :hint="`${summary?.count ?? 0} lançamento(s)`"
            hint-icon="receipt_long"
            hint-class="fp-muted"
          />
        </div>
        <div class="col-12 col-sm-4">
          <stat-card
            label="Comparado ao mês anterior"
            :value="deltaText"
            icon="trending_up"
            :color="deltaColor"
            :hint="`Mês anterior: ${formatCurrency(summary?.prevMonthTotal ?? 0)}`"
            :hint-icon="deltaIcon"
            :hint-class="deltaHintClass"
          />
        </div>
        <div class="col-12 col-sm-4">
          <stat-card
            label="Maior categoria"
            :value="summary?.topCategory?.name ?? '—'"
            :icon="summary?.topCategory?.icon ?? 'category'"
            :color="summary?.topCategory?.color ?? '#7C3AED'"
            :hint="summary?.topCategory ? `${formatCurrency(summary.topCategory.total)} (${summary.topCategory.pct}%)` : 'Sem gastos ainda'"
          />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <!-- Gastos por categoria: rosca + tabela (fallback acessível) -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="fp-card full-height">
            <q-card-section>
              <div class="fp-section-title">Gastos por categoria</div>
            </q-card-section>
            <q-separator />
            <q-card-section v-if="byCategory.length">
              <category-donut :data="byCategory" />
              <div class="q-mt-md">
                <category-table :data="byCategory" />
              </div>
            </q-card-section>
            <q-card-section v-else>
              <empty-state
                icon="donut_large"
                title="Nenhum gasto neste mês"
                message="Adicione gastos para ver a divisão por categoria."
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Evolução mensal + últimos lançamentos -->
        <div class="col-12 col-md-6">
          <q-card flat bordered class="fp-card q-mb-md">
            <q-card-section>
              <div class="fp-section-title">Evolução dos últimos 6 meses</div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <trend-chart :data="trend" />
            </q-card-section>
          </q-card>

          <q-card flat bordered class="fp-card">
            <q-card-section class="row items-center justify-between">
              <div class="fp-section-title">Últimos lançamentos</div>
              <q-btn
                flat
                no-caps
                color="primary"
                label="Ver todos"
                icon-right="arrow_forward"
                :to="{ name: 'expenses' }"
              />
            </q-card-section>
            <q-separator />
            <expense-list
              v-if="recent.length"
              :expenses="recent"
              @edit="goToExpenses"
              @changed="dashboard.fetchAll"
            />
            <empty-state
              v-else
              icon="receipt_long"
              title="Você ainda não registrou gastos"
              message="Toque em 'Meus gastos' para adicionar o primeiro."
            />
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth';
import { formatCurrency } from '@/lib/format';
import MonthSelector from '@/components/MonthSelector.vue';
import StatCard from '@/components/StatCard.vue';
import CategoryDonut from '@/components/CategoryDonut.vue';
import CategoryTable from '@/components/CategoryTable.vue';
import TrendChart from '@/components/TrendChart.vue';
import ExpenseList from '@/components/ExpenseList.vue';
import EmptyState from '@/components/EmptyState.vue';

const dashboard = useDashboardStore();
const auth = useAuthStore();
const router = useRouter();

const { summary, byCategory, trend, recent } = storeToRefs(dashboard);

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? '');

const deltaText = computed(() => {
  const d = summary.value?.deltaPct;
  if (d === null || d === undefined) return 'Sem comparação';
  const sign = d > 0 ? '+' : '';
  return `${sign}${d.toLocaleString('pt-BR')}%`;
});
const deltaIsUp = computed(() => (summary.value?.deltaPct ?? 0) > 0);
const deltaColor = computed(() => (deltaIsUp.value ? '#DC2626' : '#059669'));
const deltaIcon = computed(() =>
  summary.value?.deltaPct == null ? 'remove' : deltaIsUp.value ? 'arrow_upward' : 'arrow_downward',
);
const deltaHintClass = computed(() => (deltaIsUp.value ? 'fp-negative' : 'fp-positive'));

function goToExpenses() {
  void router.push({ name: 'expenses' });
}

onMounted(() => {
  void dashboard.fetchAll();
});
</script>
