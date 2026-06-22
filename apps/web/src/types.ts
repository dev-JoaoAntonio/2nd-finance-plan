export type ExpenseType = 'fixed' | 'variable';

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  spentAmount: number;
  type: ExpenseType;
  sacrificePriority: number;
  referenceDate: string;
}

export interface ComputedExpense extends Expense {
  balance: number;
  adjusted: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  isPhase1: boolean;
  isCompleted: boolean;
  targetDate: string | null;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  referenceDate: string;
  amount: number;
}

export interface MonthlyParameter {
  id: string | null;
  baseIncome: number;
  referenceDate: string;
}

export interface IncomeSource {
  id: string;
  referenceDate: string;
  description: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  color: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  occurredAt: string;
  categoryId: string;
  category: Category | null;
}

export interface CategorySummary {
  id: string;
  name: string;
  color: string | null;
  total: number;
  count: number;
}

export interface MonthlyCategoryBreakdown {
  name: string;
  color: string | null;
  total: number;
}

export interface MonthlyFixedBreakdown {
  title: string;
  amount: number;
}

export interface MonthlyTotal {
  month: string;
  transactions: number;
  fixed: number;
  income: number;
  transactionsBreakdown: MonthlyCategoryBreakdown[];
  fixedBreakdown: MonthlyFixedBreakdown[];
}

export interface AuthUser {
  id: string;
  username: string;
  name?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}
