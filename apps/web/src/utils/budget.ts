import type { ComputedExpense, Expense } from '@/types';

/**
 * Regra de "sacrifício": balance = amount - spentAmount. Quando há estouro
 * (balances negativos), abate o excedente das despesas com folga, da maior
 * sacrificePriority para a menor, cruzando categorias.
 */
export function computeBudgets(expenses: Expense[]): ComputedExpense[] {
  const computed: ComputedExpense[] = expenses.map((e) => {
    const balance = e.amount - e.spentAmount;
    return { ...e, balance, adjusted: balance };
  });

  let totalOverage = computed.reduce(
    (acc, e) => (e.balance < 0 ? acc + Math.abs(e.balance) : acc),
    0,
  );
  if (totalOverage <= 0) return computed;

  const donors = computed
    .filter((e) => e.balance > 0)
    .sort((a, b) => b.sacrificePriority - a.sacrificePriority);

  for (const donor of donors) {
    if (totalOverage <= 0) break;
    const take = Math.min(donor.adjusted, totalOverage);
    donor.adjusted -= take;
    totalOverage -= take;
  }

  return computed;
}
