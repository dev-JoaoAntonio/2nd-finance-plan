import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/lib/api';
import type { Category } from '@/lib/types';

export const useCategoriesStore = defineStore('categories', () => {
  const items = ref<Category[]>([]);
  const loading = ref(false);
  const loaded = ref(false);

  async function fetchAll(force = false) {
    if (loaded.value && !force) return;
    loading.value = true;
    try {
      const { data } = await api.get<Category[]>('/categories');
      items.value = data;
      loaded.value = true;
    } finally {
      loading.value = false;
    }
  }

  async function create(payload: { name: string; color: string; icon?: string }) {
    const { data } = await api.post<Category>('/categories', payload);
    items.value.push(data);
    sort();
    return data;
  }

  async function update(
    id: string,
    payload: { name?: string; color?: string; icon?: string },
  ) {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    const idx = items.value.findIndex((c) => c.id === id);
    if (idx !== -1) items.value[idx] = data;
    sort();
    return data;
  }

  async function remove(id: string) {
    await api.delete(`/categories/${id}`);
    items.value = items.value.filter((c) => c.id !== id);
  }

  async function addRule(categoryId: string, keyword: string) {
    await api.post(`/categories/${categoryId}/rules`, { keyword });
    await fetchAll(true);
  }

  async function removeRule(ruleId: string) {
    await api.delete(`/rules/${ruleId}`);
    await fetchAll(true);
  }

  function sort() {
    items.value.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  return {
    items,
    loading,
    loaded,
    fetchAll,
    create,
    update,
    remove,
    addRule,
    removeRule,
  };
});
