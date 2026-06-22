import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toDateString, toNumber } from '../common/serialize';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

const txInclude = { category: true } satisfies Prisma.TransactionInclude;
type TxRow = Prisma.TransactionGetPayload<{ include: typeof txInclude }>;

function serialize(t: TxRow) {
  return {
    id: t.id,
    amount: toNumber(t.amount),
    description: t.description,
    occurredAt: toDateString(t.occurredAt),
    categoryId: t.categoryId,
    category: t.category
      ? { id: t.category.id, name: t.category.name, color: t.category.color ?? null }
      : null,
  };
}

interface HistoryBucket {
  month: string;
  transactions: number;
  fixed: number;
  income: number;
  catMap: Map<string, { name: string; color: string | null; total: number }>;
  fixedList: { title: string; amount: number }[];
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  private monthStart(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }
  private monthLabel(d: Date): string {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`;
  }
  private addMonths(d: Date, n: number): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  }

  async findAll(from?: string, to?: string) {
    const occurredAt: Prisma.DateTimeFilter = {};
    if (from) occurredAt.gte = new Date(from);
    if (to) occurredAt.lt = new Date(to);
    const where: Prisma.TransactionWhereInput =
      from || to ? { occurredAt } : {};
    const rows = await this.prisma.transaction.findMany({
      where,
      include: txInclude,
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map(serialize);
  }

  async create(dto: CreateTransactionDto) {
    const row = await this.prisma.transaction.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        categoryId: dto.categoryId,
        occurredAt: new Date(dto.occurredAt),
        description: dto.description?.trim() || null,
      },
      include: txInclude,
    });
    return serialize(row);
  }

  async update(id: string, dto: UpdateTransactionDto) {
    await this.ensureExists(id);
    const data: Prisma.TransactionUpdateInput = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.occurredAt !== undefined) data.occurredAt = new Date(dto.occurredAt);
    if (dto.description !== undefined)
      data.description = dto.description?.trim() || null;
    if (dto.categoryId !== undefined)
      data.category = { connect: { id: dto.categoryId } };
    const row = await this.prisma.transaction.update({
      where: { id },
      data,
      include: txInclude,
    });
    return serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.transaction.delete({ where: { id } });
    return { success: true };
  }

  async summaryByCategory(from: string, to: string) {
    const rows = await this.prisma.transaction.findMany({
      where: { occurredAt: { gte: new Date(from), lt: new Date(to) } },
      include: txInclude,
    });
    const map = new Map<
      string,
      { id: string; name: string; color: string | null; total: number; count: number }
    >();
    for (const t of rows) {
      const cat = t.category;
      const id = cat?.id ?? '_none_';
      const entry = map.get(id) ?? {
        id,
        name: cat?.name ?? 'Sem categoria',
        color: cat?.color ?? null,
        total: 0,
        count: 0,
      };
      entry.total += toNumber(t.amount);
      entry.count += 1;
      map.set(id, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }

  async monthlyHistory(months = 12) {
    const now = new Date();
    const end = this.monthStart(this.addMonths(now, 1));
    const start = this.addMonths(end, -months);

    const [txs, fixed, params] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { occurredAt: { gte: start, lt: end } },
        include: txInclude,
      }),
      this.prisma.expense.findMany({
        where: { type: 'fixed', referenceDate: { gte: start, lt: end } },
        select: { referenceDate: true, spentAmount: true, title: true },
      }),
      this.prisma.monthlyParameter.findMany({
        where: { referenceDate: { gte: start, lt: end } },
        select: { referenceDate: true, baseIncome: true },
      }),
    ]);

    const buckets = new Map<string, HistoryBucket>();
    for (let i = 0; i < months; i++) {
      const key = this.monthLabel(this.addMonths(start, i));
      buckets.set(key, {
        month: key,
        transactions: 0,
        fixed: 0,
        income: 0,
        catMap: new Map(),
        fixedList: [],
      });
    }

    for (const t of txs) {
      const b = buckets.get(this.monthLabel(this.monthStart(t.occurredAt)));
      if (!b) continue;
      const amt = toNumber(t.amount);
      b.transactions += amt;
      const name = t.category?.name ?? 'Sem categoria';
      const entry = b.catMap.get(name) ?? {
        name,
        color: t.category?.color ?? null,
        total: 0,
      };
      entry.total += amt;
      b.catMap.set(name, entry);
    }
    for (const f of fixed) {
      const b = buckets.get(this.monthLabel(this.monthStart(f.referenceDate)));
      if (!b) continue;
      const amt = toNumber(f.spentAmount);
      b.fixed += amt;
      if (amt > 0) b.fixedList.push({ title: f.title, amount: amt });
    }
    for (const p of params) {
      const b = buckets.get(this.monthLabel(this.monthStart(p.referenceDate)));
      if (!b) continue;
      b.income = toNumber(p.baseIncome);
    }

    return Array.from(buckets.values()).map((b) => ({
      month: b.month,
      transactions: Math.round(b.transactions * 100) / 100,
      fixed: Math.round(b.fixed * 100) / 100,
      income: b.income,
      transactionsBreakdown: Array.from(b.catMap.values()).sort(
        (a, b) => b.total - a.total,
      ),
      fixedBreakdown: b.fixedList.sort((a, b) => b.amount - a.amount),
    }));
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.transaction.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Transação ${id} não encontrada.`);
  }
}
