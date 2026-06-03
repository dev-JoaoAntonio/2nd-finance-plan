const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const monthFmt = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});

/** Formata um valor numérico como moeda brasileira (R$). */
export function formatCurrency(value: number): string {
  return brl.format(value ?? 0);
}

/** Formata uma data (Date ou ISO string) como dd/mm/aaaa. */
export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return dateFmt.format(d);
}

/** "2026-06" -> "Junho de 2026". */
export function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  const label = monthFmt.format(d);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "2026-06" -> "jun/26" (rótulo curto para eixos de gráfico). */
export function formatMonthShort(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(d)
    .replace('.', '');
  return `${month}/${String(y).slice(2)}`;
}

/** Chave "YYYY-MM" do mês atual. */
export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** ISO (yyyy-mm-dd) de hoje, para inputs de data. */
export function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
