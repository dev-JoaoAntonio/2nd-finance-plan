/**
 * Converte "YYYY-MM" no intervalo [início, fim) do mês em UTC.
 * Sem argumento (ou inválido), usa o mês atual.
 */
export function monthRange(month?: string): { start: Date; end: Date; key: string } {
  let year: number;
  let monthIndex: number; // 0-based

  const match = month?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    year = Number(match[1]);
    monthIndex = Number(match[2]) - 1;
  } else {
    const now = new Date();
    year = now.getUTCFullYear();
    monthIndex = now.getUTCMonth();
  }

  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0, 0));
  const key = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`;
  return { start, end, key };
}

/** Desloca uma chave "YYYY-MM" por `delta` meses (pode ser negativo). */
export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
