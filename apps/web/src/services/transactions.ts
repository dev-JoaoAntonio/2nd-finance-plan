import { api } from './api';
import type { CategorySummary, MonthlyTotal, Transaction } from '@/types';

export interface TransactionInput {
  amount: number;
  categoryId: string;
  occurredAt: string;
  description?: string | null;
}

export const transactionsService = {
  async list(from?: string, to?: string): Promise<Transaction[]> {
    const { data } = await api.get<Transaction[]>('/transactions', {
      params: { from, to },
    });
    return data;
  },
  async create(payload: TransactionInput): Promise<Transaction> {
    const { data } = await api.post<Transaction>('/transactions', payload);
    return data;
  },
  async update(id: string, payload: Partial<TransactionInput>): Promise<Transaction> {
    const { data } = await api.patch<Transaction>(`/transactions/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
  },
  async summary(from: string, to: string): Promise<CategorySummary[]> {
    const { data } = await api.get<CategorySummary[]>('/transactions/summary', {
      params: { from, to },
    });
    return data;
  },
  async monthlyHistory(months = 12): Promise<MonthlyTotal[]> {
    const { data } = await api.get<MonthlyTotal[]>(
      '/transactions/monthly-history',
      { params: { months } },
    );
    return data;
  },
};
