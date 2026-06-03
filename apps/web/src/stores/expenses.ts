import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/lib/api';
import { currentMonthKey } from '@/lib/format';
import type { Expense } from '@/lib/types';

export interface ExpensePayload {
  amount: number;
  description: string;
  date: string;
  categoryId?: string | null;
  note?: string | null;
}

export const useExpensesStore = defineStore('expenses', () => {
  const items = ref<Expense[]>([]);
  const loading = ref(false);
  const month = ref(currentMonthKey());
  const categoryFilter = ref<string | null>(null);

  async function fetch() {
    loading.value = true;
    try {
      const params: Record<string, string> = {};
      if (month.value) params.month = month.value;
      if (categoryFilter.value) params.categoryId = categoryFilter.value;
      const { data } = await api.get<Expense[]>('/expenses', { params });
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  function setMonth(value: string) {
    month.value = value;
    return fetch();
  }

  function setCategoryFilter(value: string | null) {
    categoryFilter.value = value;
    return fetch();
  }

  async function create(payload: ExpensePayload) {
    const { data } = await api.post<Expense>('/expenses', payload);
    await fetch();
    return data; // inclui o flag autoCategorized
  }

  async function update(id: string, payload: Partial<ExpensePayload> & { clearCategory?: boolean }) {
    const { data } = await api.patch<Expense>(`/expenses/${id}`, payload);
    await fetch();
    return data;
  }

  async function remove(id: string) {
    await api.delete(`/expenses/${id}`);
    items.value = items.value.filter((e) => e.id !== id);
  }

  return {
    items,
    loading,
    month,
    categoryFilter,
    fetch,
    setMonth,
    setCategoryFilter,
    create,
    update,
    remove,
  };
});
