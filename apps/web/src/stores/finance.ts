import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { financeService, type ExpenseInput } from '@/services/finance';
import { categoriesService } from '@/services/categories';
import { transactionsService } from '@/services/transactions';
import { computeBudgets } from '@/utils/budget';
import { formatCurrency } from '@/utils/format';
import type {
  Category,
  CategorySummary,
  Expense,
  Goal,
  GoalContribution,
  IncomeSource,
  MonthlyTotal,
  Transaction,
} from '@/types';

// Personalização: título da meta principal de longo prazo (genérico).
export const LONG_TERM_TITLE = 'Meta de longo prazo';

function currentMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function shiftMonth(ref: string, delta: number): string {
  const [y, m] = ref.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
function entryRate(e: MonthlyTotal): number {
  return e.income > 0
    ? Math.max(0, (e.income - e.fixed - e.transactions) / e.income)
    : 0;
}
function pctDelta(cur: number, prev: number): number | null {
  if (!prev || prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export const useFinanceStore = defineStore('finance', () => {
  const currentMonth = ref(currentMonthStart());
  const expenses = ref<Expense[]>([]);
  const goals = ref<Goal[]>([]);
  const income = ref(0);
  const loading = ref(false);
  const initialized = ref(false);
  const transactions = ref<Transaction[]>([]);
  const categories = ref<Category[]>([]);
  const summary = ref<CategorySummary[]>([]);
  const monthlyHistory = ref<MonthlyTotal[]>([]);
  const goalContributions = ref<GoalContribution[]>([]);
  const incomeSources = ref<IncomeSource[]>([]);

  // ── Getters ────────────────────────────────────────────────────────────
  const computedExpenses = computed(() => computeBudgets(expenses.value));
  const fixedExpenses = computedExpenses;
  const fixedPlanned = computed(() =>
    expenses.value.reduce((a, e) => a + e.amount, 0),
  );
  const fixedSpent = computed(() =>
    expenses.value.reduce((a, e) => a + e.spentAmount, 0),
  );
  const transactionsTotal = computed(() =>
    transactions.value.reduce((a, t) => a + t.amount, 0),
  );
  const totalSpent = computed(() => fixedSpent.value + transactionsTotal.value);
  const available = computed(() => income.value - totalSpent.value);

  const longTermGoal = computed<Goal | null>(
    () =>
      goals.value.find((g) => g.title === LONG_TERM_TITLE) ??
      goals.value.find((g) => !g.isPhase1) ??
      null,
  );
  const longTerm = computed(() => ({
    saved: longTermGoal.value?.savedAmount ?? 0,
    target: longTermGoal.value?.targetAmount ?? 0,
    targetDate: longTermGoal.value?.targetDate ?? null,
  }));
  const longTermPct = computed(() =>
    longTerm.value.target > 0
      ? clamp((longTerm.value.saved / longTerm.value.target) * 100, 0, 100)
      : 0,
  );
  const achievements = computed(() => goals.value.filter((g) => g.isPhase1));
  const savingsRate = computed(() =>
    income.value > 0 ? Math.max(0, available.value / income.value) : 0,
  );
  const projection = computed<number | null>(() => {
    if (currentMonth.value !== currentMonthStart() || totalSpent.value <= 0)
      return null;
    const now = new Date();
    const day = now.getDate();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    return (totalSpent.value / day) * daysInMonth;
  });
  const topTransactions = computed(() =>
    [...transactions.value].sort((a, b) => b.amount - a.amount).slice(0, 5),
  );

  const currentHistoryEntry = computed(() =>
    monthlyHistory.value.find((h) => h.month === currentMonth.value),
  );
  const previousHistoryEntry = computed(() => {
    const idx = monthlyHistory.value.findIndex(
      (h) => h.month === currentMonth.value,
    );
    return idx > 0 ? monthlyHistory.value[idx - 1] : undefined;
  });

  const totalSpentDelta = computed(() => {
    const c = currentHistoryEntry.value;
    const p = previousHistoryEntry.value;
    if (!c || !p) return null;
    return pctDelta(c.fixed + c.transactions, p.fixed + p.transactions);
  });
  const fixedSpentDelta = computed(() => {
    const c = currentHistoryEntry.value;
    const p = previousHistoryEntry.value;
    if (!c || !p) return null;
    return pctDelta(c.fixed, p.fixed);
  });
  const transactionsDelta = computed(() => {
    const c = currentHistoryEntry.value;
    const p = previousHistoryEntry.value;
    if (!c || !p) return null;
    return pctDelta(c.transactions, p.transactions);
  });
  const savingsRateDelta = computed(() => {
    const c = currentHistoryEntry.value;
    const p = previousHistoryEntry.value;
    if (!c || !p) return null;
    return Math.round((entryRate(c) - entryRate(p)) * 100 * 10) / 10;
  });

  const spark = (pick: (e: MonthlyTotal) => number) =>
    monthlyHistory.value.map(pick).slice(-6);
  const sparkFixed = computed(() => spark((e) => e.fixed));
  const sparkTx = computed(() => spark((e) => e.transactions));
  const sparkAvailable = computed(() =>
    spark((e) => e.income - e.fixed - e.transactions),
  );
  const sparkSavings = computed(() => spark((e) => entryRate(e) * 100));

  const dailyMap = computed(() => {
    const map: Record<string, number> = {};
    for (const t of transactions.value) {
      map[t.occurredAt] = (map[t.occurredAt] ?? 0) + t.amount;
    }
    return map;
  });

  const insights = computed(() => {
    const out: { kind: 'good' | 'warn' | 'info'; text: string }[] = [];
    const top = [...summary.value].sort((a, b) => b.total - a.total)[0];
    if (top && top.total > 0) {
      out.push({
        kind: 'info',
        text: `Maior categoria do mês: ${top.name} (${formatCurrency(top.total)}).`,
      });
    }
    const cur = currentHistoryEntry.value;
    const prev = previousHistoryEntry.value;
    if (cur && prev) {
      const prevMap = new Map(
        prev.transactionsBreakdown.map((b) => [b.name, b.total]),
      );
      let topRise: { name: string; pct: number } | null = null;
      let topFall: { name: string; pct: number } | null = null;
      for (const b of cur.transactionsBreakdown) {
        const before = prevMap.get(b.name) ?? 0;
        if (before <= 0) continue;
        const change = ((b.total - before) / before) * 100;
        if (change > 15 && (!topRise || change > topRise.pct))
          topRise = { name: b.name, pct: change };
        if (change < -10 && (!topFall || change < topFall.pct))
          topFall = { name: b.name, pct: change };
      }
      if (topRise)
        out.push({
          kind: 'warn',
          text: `${topRise.name} subiu ${Math.round(topRise.pct)}% vs mês passado.`,
        });
      if (topFall)
        out.push({
          kind: 'good',
          text: `Você gastou ${Math.round(Math.abs(topFall.pct))}% menos em ${topFall.name}.`,
        });
    }
    const rate = savingsRate.value * 100;
    if (rate >= 20)
      out.push({ kind: 'good', text: `Taxa de poupança em ${Math.round(rate)}% — ritmo forte!` });
    else if (rate > 0 && rate <= 10)
      out.push({ kind: 'warn', text: `Poupança de só ${Math.round(rate)}% — sobra apertada.` });
    else if (rate <= 0)
      out.push({ kind: 'warn', text: 'Gastos do mês superaram a renda.' });
    return out.slice(0, 4);
  });

  // ── Actions ────────────────────────────────────────────────────────────
  function monthBounds() {
    return { from: currentMonth.value, to: shiftMonth(currentMonth.value, 1) };
  }

  async function loadMonth() {
    loading.value = true;
    try {
      const { from, to } = monthBounds();
      const [exp, param, gls, txs, sum, sources] = await Promise.all([
        financeService.listExpenses(currentMonth.value),
        financeService.getMonthlyParameter(currentMonth.value),
        financeService.listGoals(),
        transactionsService.list(from, to),
        transactionsService.summary(from, to),
        financeService.listIncomeSources(currentMonth.value),
      ]);
      expenses.value = exp.filter((e) => e.type === 'fixed');
      income.value = param.baseIncome;
      goals.value = gls;
      transactions.value = txs;
      summary.value = sum;
      incomeSources.value = sources;
    } finally {
      loading.value = false;
    }
  }

  async function refreshHistory() {
    monthlyHistory.value = await transactionsService.monthlyHistory(12);
  }

  async function init() {
    if (initialized.value) return;
    categories.value = await categoriesService.list();
    await refreshHistory();
    await loadMonth();
    await refreshContributions();
    initialized.value = true;
  }

  async function setMonth(ref: string) {
    currentMonth.value = ref;
    await loadMonth();
    await refreshContributions();
  }
  const prevMonth = () => setMonth(shiftMonth(currentMonth.value, -1));
  const nextMonth = () => setMonth(shiftMonth(currentMonth.value, 1));

  // Despesas (passivos fixos)
  async function createExpense(payload: Omit<ExpenseInput, 'type' | 'referenceDate'>) {
    await financeService.createExpense({
      ...payload,
      type: 'fixed',
      referenceDate: currentMonth.value,
    });
    await loadMonth();
    await refreshHistory();
  }
  async function updateExpense(id: string, payload: Partial<ExpenseInput>) {
    await financeService.updateExpense(id, payload);
    await loadMonth();
    await refreshHistory();
  }
  async function updateSpent(id: string, spentAmount: number) {
    await financeService.updateExpense(id, { spentAmount });
    await loadMonth();
    await refreshHistory();
  }
  async function deleteExpense(id: string) {
    await financeService.deleteExpense(id);
    await loadMonth();
    await refreshHistory();
  }

  // Renda direta
  async function saveIncome(value: number) {
    const p = await financeService.upsertMonthlyParameter(currentMonth.value, value);
    income.value = p.baseIncome;
    await refreshHistory();
  }

  // Fontes de renda (recalculam o baseIncome no backend)
  async function reloadIncome() {
    const [param, sources] = await Promise.all([
      financeService.getMonthlyParameter(currentMonth.value),
      financeService.listIncomeSources(currentMonth.value),
    ]);
    income.value = param.baseIncome;
    incomeSources.value = sources;
    await refreshHistory();
  }
  async function addIncomeSource(description: string, amount: number) {
    await financeService.createIncomeSource({
      referenceDate: currentMonth.value,
      description,
      amount,
    });
    await reloadIncome();
  }
  async function updateIncomeSource(
    id: string,
    payload: { description?: string; amount?: number },
  ) {
    await financeService.updateIncomeSource(id, payload);
    await reloadIncome();
  }
  async function deleteIncomeSource(id: string) {
    await financeService.deleteIncomeSource(id);
    await reloadIncome();
  }

  // Conquistas
  async function addAchievement(title: string) {
    await financeService.createGoal({ title, isPhase1: true, targetAmount: 0 });
    goals.value = await financeService.listGoals();
  }
  async function toggleAchievement(goal: Goal) {
    await financeService.updateGoal(goal.id, { isCompleted: !goal.isCompleted });
    goals.value = await financeService.listGoals();
  }
  async function deleteGoal(id: string) {
    await financeService.deleteGoal(id);
    goals.value = await financeService.listGoals();
    await refreshContributions();
  }

  // Meta de longo prazo
  async function updateLongTerm(payload: {
    saved?: number;
    target?: number;
    targetDate?: string | null;
  }) {
    const data: Partial<Goal> = {};
    if (payload.saved !== undefined) data.savedAmount = payload.saved;
    if (payload.target !== undefined) data.targetAmount = payload.target;
    if (payload.targetDate !== undefined) data.targetDate = payload.targetDate;
    if (longTermGoal.value) {
      await financeService.updateGoal(longTermGoal.value.id, data);
    } else {
      await financeService.createGoal({
        title: LONG_TERM_TITLE,
        isPhase1: false,
        ...data,
      });
    }
    goals.value = await financeService.listGoals();
  }

  // Aportes da meta
  async function refreshContributions() {
    if (!longTermGoal.value) {
      goalContributions.value = [];
      return;
    }
    goalContributions.value = await financeService.listContributions(
      longTermGoal.value.id,
    );
  }
  async function saveContribution(referenceDate: string, amount: number) {
    if (!longTermGoal.value) return;
    await financeService.upsertContribution(
      longTermGoal.value.id,
      referenceDate,
      amount,
    );
    await refreshContributions();
  }
  async function deleteContribution(referenceDate: string) {
    if (!longTermGoal.value) return;
    await financeService.deleteContribution(longTermGoal.value.id, referenceDate);
    await refreshContributions();
  }

  // Transações
  async function createTransaction(payload: {
    amount: number;
    categoryId: string;
    occurredAt: string;
    description?: string | null;
  }) {
    await transactionsService.create(payload);
    await loadMonth();
    await refreshHistory();
  }
  async function updateTransaction(
    id: string,
    payload: Partial<{
      amount: number;
      categoryId: string;
      occurredAt: string;
      description: string | null;
    }>,
  ) {
    await transactionsService.update(id, payload);
    await loadMonth();
    await refreshHistory();
  }
  async function deleteTransaction(id: string) {
    await transactionsService.remove(id);
    await loadMonth();
    await refreshHistory();
  }

  // Categorias
  async function createCategory(payload: { name: string; color?: string | null }) {
    await categoriesService.create(payload);
    categories.value = await categoriesService.list();
  }
  async function updateCategory(
    id: string,
    payload: { name?: string; color?: string | null },
  ) {
    await categoriesService.update(id, payload);
    categories.value = await categoriesService.list();
  }
  async function deleteCategory(id: string) {
    await categoriesService.remove(id);
    categories.value = await categoriesService.list();
  }

  return {
    // state
    currentMonth,
    expenses,
    goals,
    income,
    loading,
    initialized,
    transactions,
    categories,
    summary,
    monthlyHistory,
    goalContributions,
    incomeSources,
    // getters
    computedExpenses,
    fixedExpenses,
    fixedPlanned,
    fixedSpent,
    transactionsTotal,
    totalSpent,
    available,
    longTermGoal,
    longTerm,
    longTermPct,
    achievements,
    savingsRate,
    projection,
    topTransactions,
    currentHistoryEntry,
    previousHistoryEntry,
    totalSpentDelta,
    fixedSpentDelta,
    transactionsDelta,
    savingsRateDelta,
    sparkFixed,
    sparkTx,
    sparkAvailable,
    sparkSavings,
    dailyMap,
    insights,
    // actions
    init,
    loadMonth,
    refreshHistory,
    setMonth,
    prevMonth,
    nextMonth,
    createExpense,
    updateExpense,
    updateSpent,
    deleteExpense,
    saveIncome,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addAchievement,
    toggleAchievement,
    deleteGoal,
    updateLongTerm,
    refreshContributions,
    saveContribution,
    deleteContribution,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
