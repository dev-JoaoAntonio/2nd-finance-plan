import { api } from './api';
import type {
  Expense,
  ExpenseType,
  Goal,
  GoalContribution,
  IncomeSource,
  MonthlyParameter,
} from '@/types';

export interface ExpenseInput {
  title: string;
  description?: string | null;
  amount: number;
  spentAmount?: number;
  type: ExpenseType;
  sacrificePriority?: number;
  referenceDate: string;
}

export const financeService = {
  // Expenses (passivos fixos)
  async listExpenses(referenceDate?: string): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>('/expenses', {
      params: { referenceDate },
    });
    return data;
  },
  async createExpense(payload: ExpenseInput): Promise<Expense> {
    const { data } = await api.post<Expense>('/expenses', payload);
    return data;
  },
  async updateExpense(id: string, payload: Partial<ExpenseInput>): Promise<Expense> {
    const { data } = await api.patch<Expense>(`/expenses/${id}`, payload);
    return data;
  },
  async deleteExpense(id: string) {
    const { data } = await api.delete(`/expenses/${id}`);
    return data;
  },

  // Goals
  async listGoals(): Promise<Goal[]> {
    const { data } = await api.get<Goal[]>('/goals');
    return data;
  },
  async createGoal(payload: Partial<Goal>): Promise<Goal> {
    const { data } = await api.post<Goal>('/goals', payload);
    return data;
  },
  async updateGoal(id: string, payload: Partial<Goal>): Promise<Goal> {
    const { data } = await api.patch<Goal>(`/goals/${id}`, payload);
    return data;
  },
  async deleteGoal(id: string) {
    const { data } = await api.delete(`/goals/${id}`);
    return data;
  },

  // Goal contributions
  async listContributions(goalId: string): Promise<GoalContribution[]> {
    const { data } = await api.get<GoalContribution[]>(
      `/goals/${goalId}/contributions`,
    );
    return data;
  },
  async upsertContribution(
    goalId: string,
    referenceDate: string,
    amount: number,
  ): Promise<GoalContribution> {
    const { data } = await api.put<GoalContribution>(
      `/goals/${goalId}/contributions`,
      { referenceDate, amount },
    );
    return data;
  },
  async deleteContribution(goalId: string, referenceDate: string) {
    const { data } = await api.delete(
      `/goals/${goalId}/contributions/${referenceDate}`,
    );
    return data;
  },

  // Monthly parameters
  async getLatestMonth(): Promise<{ month: string | null }> {
    const { data } = await api.get<{ month: string | null }>(
      '/monthly-parameters/latest-month',
    );
    return data;
  },
  async getMonthlyParameter(referenceDate: string): Promise<MonthlyParameter> {
    const { data } = await api.get<MonthlyParameter>('/monthly-parameters', {
      params: { referenceDate },
    });
    return data;
  },
  async upsertMonthlyParameter(
    referenceDate: string,
    baseIncome: number,
  ): Promise<MonthlyParameter> {
    const { data } = await api.put<MonthlyParameter>('/monthly-parameters', {
      referenceDate,
      baseIncome,
    });
    return data;
  },

  // Income sources
  async listIncomeSources(referenceDate: string): Promise<IncomeSource[]> {
    const { data } = await api.get<IncomeSource[]>(
      '/monthly-parameters/income-sources',
      { params: { referenceDate } },
    );
    return data;
  },
  async createIncomeSource(payload: {
    referenceDate: string;
    description: string;
    amount: number;
  }): Promise<IncomeSource> {
    const { data } = await api.post<IncomeSource>(
      '/monthly-parameters/income-sources',
      payload,
    );
    return data;
  },
  async updateIncomeSource(
    id: string,
    payload: { description?: string; amount?: number },
  ): Promise<IncomeSource> {
    const { data } = await api.patch<IncomeSource>(
      `/monthly-parameters/income-sources/${id}`,
      payload,
    );
    return data;
  },
  async deleteIncomeSource(id: string) {
    const { data } = await api.delete(
      `/monthly-parameters/income-sources/${id}`,
    );
    return data;
  },
};
