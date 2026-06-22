import { Prisma } from '@prisma/client';

/** Prisma.Decimal | number | null → number (null/undefined → fallback). */
export function toNumber(
  value: Prisma.Decimal | number | null | undefined,
  fallback = 0,
): number {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'number' ? value : Number(value.toString());
}

/** Date → 'YYYY-MM-DD'. */
export function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}
