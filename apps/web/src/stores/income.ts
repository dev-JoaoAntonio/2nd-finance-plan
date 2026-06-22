import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/lib/api';
import { currentMonthKey } from '@/lib/format';
import type { Income } from '@/lib/types';

export interface IncomePayload {
  amount: number;
  source: string;
  date: string;
  note?: string | null;
}

export const useIncomeStore = defineStore('income', () => {
  const items = ref<Income[]>([]);
  const loading = ref(false);
  const month = ref(currentMonthKey());

  async function fetch() {
    loading.value = true;
    try {
      const params: Record<string, string> = {};
      if (month.value) params.month = month.value;
      const { data } = await api.get<Income[]>('/income', { params });
      items.value = data;
    } finally {
      loading.value = false;
    }
  }

  function setMonth(value: string) {
    month.value = value;
    return fetch();
  }

  async function create(payload: IncomePayload) {
    const { data } = await api.post<Income>('/income', payload);
    await fetch();
    return data;
  }

  async function update(id: string, payload: Partial<IncomePayload>) {
    const { data } = await api.patch<Income>(`/income/${id}`, payload);
    await fetch();
    return data;
  }

  async function remove(id: string) {
    await api.delete(`/income/${id}`);
    items.value = items.value.filter((i) => i.id !== id);
  }

  return { items, loading, month, fetch, setMonth, create, update, remove };
});
