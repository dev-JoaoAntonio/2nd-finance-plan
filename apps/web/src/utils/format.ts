const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function formatCurrency(n: number): string {
  return (n ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDecimal(n: number): string {
  return (n ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** "1.234,56" / "1234,56" / "R$ 50" → number. */
export function parseInput(str: string): number {
  const cleaned = (str ?? '')
    .toString()
    .replace(/[^\d,-]/g, '')
    .replace(/,/g, '.');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** "2026-05-01" → "Maio de 2026". */
export function formatMonthLabel(ref: string): string {
  if (!ref) return '';
  const [y, m] = ref.split('-').map(Number);
  const name = MONTHS_PT[(m || 1) - 1] ?? '';
  return `${name} de ${y}`;
}
