export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CategoryRule {
  id: string;
  categoryId: string;
  keyword: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  rules?: CategoryRule[];
  _count?: { expenses: number };
}

/** Categoria embutida em um gasto (subconjunto). */
export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO
  note: string | null;
  categoryId: string | null;
  category: ExpenseCategory | null;
  createdAt: string;
  updatedAt: string;
  autoCategorized?: boolean;
}

export interface CategoryBreakdown {
  categoryId: string | null;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  pct: number;
}

export interface Summary {
  month: string;
  total: number;
  count: number;
  prevMonthTotal: number;
  deltaPct: number | null;
  topCategory: CategoryBreakdown | null;
}

export interface TrendPoint {
  month: string;
  total: number;
}
