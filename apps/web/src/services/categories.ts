import { api } from './api';
import type { Category } from '@/types';

export const categoriesService = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },
  async create(payload: { name: string; color?: string | null }) {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },
  async update(id: string, payload: { name?: string; color?: string | null }) {
    const { data } = await api.patch<Category>(`/categories/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },
};
