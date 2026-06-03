import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { monthRange, shiftMonthKey } from '../common/month-range';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resumo do mês: total, qtde, total do mês anterior, variação % e maior categoria. */
  async summary(userId: string, month?: string) {
    const { start, end, key } = monthRange(month);
    const prev = monthRange(shiftMonthKey(key, -1));

    const [current, previous, byCat] = await Promise.all([
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: start, lt: end } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { userId, date: { gte: prev.start, lt: prev.end } },
        _sum: { amount: true },
      }),
      this.byCategory(userId, month),
    ]);

    const total = Number(current._sum.amount ?? 0);
    const prevMonthTotal = Number(previous._sum.amount ?? 0);
    const deltaPct =
      prevMonthTotal > 0
        ? Math.round(((total - prevMonthTotal) / prevMonthTotal) * 1000) / 10
        : null;

    const topCategory = byCat.length > 0 ? byCat[0] : null;

    return {
      month: key,
      total,
      count: current._count,
      prevMonthTotal,
      deltaPct,
      topCategory,
    };
  }

  /** Gasto por categoria no mês (ordenado do maior para o menor), com participação %. */
  async byCategory(userId: string, month?: string) {
    const { start, end } = monthRange(month);

    const grouped = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId, date: { gte: start, lt: end } },
      _sum: { amount: true },
      _count: true,
    });

    const total = grouped.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0);

    const categories = await this.prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, color: true, icon: true },
    });
    const byId = new Map(categories.map((c) => [c.id, c]));

    return grouped
      .map((g) => {
        const cat = g.categoryId ? byId.get(g.categoryId) : undefined;
        const value = Number(g._sum.amount ?? 0);
        return {
          categoryId: g.categoryId,
          name: cat?.name ?? 'Sem categoria',
          color: cat?.color ?? '#94A3B8',
          icon: cat?.icon ?? 'help',
          total: value,
          count: g._count,
          pct: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }

  /** Tendência dos últimos N meses (total por mês), terminando no mês informado/atual. */
  async monthlyTrend(userId: string, month?: string, months = 6) {
    const anchor = monthRange(month);
    const oldestKey = shiftMonthKey(anchor.key, -(months - 1));
    const oldest = monthRange(oldestKey);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: oldest.start, lt: anchor.end } },
      select: { date: true, amount: true },
    });

    // Inicializa todos os meses do intervalo com zero (para o gráfico não ter buracos).
    const buckets = new Map<string, number>();
    for (let i = 0; i < months; i++) {
      buckets.set(shiftMonthKey(oldestKey, i), 0);
    }

    for (const exp of expenses) {
      const d = exp.date;
      const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (buckets.has(k)) {
        buckets.set(k, (buckets.get(k) ?? 0) + Number(exp.amount));
      }
    }

    return Array.from(buckets.entries()).map(([key, total]) => ({
      month: key,
      total: Math.round(total * 100) / 100,
    }));
  }
}
