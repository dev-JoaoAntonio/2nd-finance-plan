import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/lib/api';
import { currentMonthKey } from '@/lib/format';
import { activeBrand } from '@/brands';
import type { Summary, CategoryBreakdown, TrendPoint, Expense } from '@/lib/types';

export const useDashboardStore = defineStore('dashboard', () => {
  const month = ref(currentMonthKey());
  const summary = ref<Summary | null>(null);
  const byCategory = ref<CategoryBreakdown[]>([]);
  const trend = ref<TrendPoint[]>([]);
  const recent = ref<Expense[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const [s, c, t, r] = await Promise.all([
        api.get<Summary>('/analytics/summary', { params: { month: month.value } }),
        api.get<CategoryBreakdown[]>('/analytics/by-category', {
          params: { month: month.value },
        }),
        api.get<TrendPoint[]>('/analytics/monthly-trend', {
          params: { month: month.value, months: activeBrand.dashboard.trendMonths },
        }),
        api.get<Expense[]>('/expenses', { params: { month: month.value } }),
      ]);
      summary.value = s.data;
      byCategory.value = c.data;
      trend.value = t.data;
      recent.value = r.data.slice(0, 5);
    } finally {
      loading.value = false;
    }
  }

  function setMonth(value: string) {
    month.value = value;
    return fetchAll();
  }

  return { month, summary, byCategory, trend, recent, loading, fetchAll, setMonth };
});
