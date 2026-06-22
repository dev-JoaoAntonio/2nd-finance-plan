import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toDateString, toNumber } from '../common/serialize';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

type ExpenseRow = {
  id: string;
  title: string;
  description: string | null;
  amount: Prisma.Decimal;
  spentAmount: Prisma.Decimal | null;
  type: string;
  sacrificePriority: number | null;
  referenceDate: Date;
};

function serialize(e: ExpenseRow) {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    amount: toNumber(e.amount),
    spentAmount: toNumber(e.spentAmount),
    type: e.type,
    sacrificePriority: e.sacrificePriority ?? 5,
    referenceDate: toDateString(e.referenceDate),
  };
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(referenceDate?: string) {
    if (referenceDate) await this.ensureFixedForMonth(referenceDate);
    const where: Prisma.ExpenseWhereInput = referenceDate
      ? { referenceDate: new Date(referenceDate) }
      : {};
    const rows = await this.prisma.expense.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });
    return rows.map(serialize);
  }

  /** Passivos fixos são recorrentes: se o mês ainda não tem fixos, clona os do
   *  mês anterior mais recente (zerando o gasto). */
  private async ensureFixedForMonth(referenceDate: string) {
    const date = new Date(referenceDate);
    const existing = await this.prisma.expense.count({
      where: { type: 'fixed', referenceDate: date },
    });
    if (existing > 0) return;

    const last = await this.prisma.expense.findFirst({
      where: { type: 'fixed', referenceDate: { lt: date } },
      orderBy: { referenceDate: 'desc' },
      select: { referenceDate: true },
    });
    if (!last) return;

    const prev = await this.prisma.expense.findMany({
      where: { type: 'fixed', referenceDate: last.referenceDate },
    });
    if (prev.length === 0) return;

    await this.prisma.expense.createMany({
      data: prev.map((p) => ({
        title: p.title,
        description: p.description,
        amount: p.amount,
        type: p.type,
        sacrificePriority: p.sacrificePriority,
        category_id: p.category_id,
        referenceDate: date,
        spentAmount: new Prisma.Decimal(0),
      })),
    });
  }

  async create(dto: CreateExpenseDto) {
    const row = await this.prisma.expense.create({
      data: {
        title: dto.title.trim(),
        description: dto.description ?? null,
        amount: new Prisma.Decimal(dto.amount),
        spentAmount: new Prisma.Decimal(dto.spentAmount ?? 0),
        type: dto.type,
        sacrificePriority: dto.sacrificePriority ?? 5,
        referenceDate: new Date(dto.referenceDate),
      },
    });
    return serialize(row);
  }

  async update(id: string, dto: UpdateExpenseDto) {
    await this.ensureExists(id);
    const data: Prisma.ExpenseUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description ?? null;
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.spentAmount !== undefined)
      data.spentAmount = new Prisma.Decimal(dto.spentAmount);
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.sacrificePriority !== undefined)
      data.sacrificePriority = dto.sacrificePriority;
    if (dto.referenceDate !== undefined)
      data.referenceDate = new Date(dto.referenceDate);
    const row = await this.prisma.expense.update({ where: { id }, data });
    return serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.expense.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.expense.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Despesa ${id} não encontrada.`);
  }
}
