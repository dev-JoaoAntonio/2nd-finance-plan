import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Income } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { monthRange } from '../common/month-range';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { QueryIncomeDto } from './dto/query-income.dto';

@Injectable()
export class IncomeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: QueryIncomeDto) {
    const where: Prisma.IncomeWhereInput = { userId };

    if (query.month) {
      const { start, end } = monthRange(query.month);
      where.date = { gte: start, lt: end };
    }

    const incomes = await this.prisma.income.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
    return incomes.map(serialize);
  }

  async create(userId: string, dto: CreateIncomeDto) {
    const income = await this.prisma.income.create({
      data: {
        userId,
        amount: new Prisma.Decimal(dto.amount),
        source: dto.source.trim(),
        note: dto.note?.trim() || null,
        date: new Date(dto.date),
      },
    });
    return serialize(income);
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    await this.ensureIncomeOwned(userId, id);

    const data: Prisma.IncomeUpdateInput = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.source !== undefined) data.source = dto.source.trim();
    if (dto.note !== undefined) data.note = dto.note?.trim() || null;
    if (dto.date !== undefined) data.date = new Date(dto.date);

    const income = await this.prisma.income.update({ where: { id }, data });
    return serialize(income);
  }

  async remove(userId: string, id: string) {
    await this.ensureIncomeOwned(userId, id);
    await this.prisma.income.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureIncomeOwned(userId: string, id: string) {
    const income = await this.prisma.income.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!income || income.userId !== userId) {
      throw new NotFoundException('Renda não encontrada.');
    }
  }
}

/** Converte o Decimal do Prisma em number para o front consumir facilmente. */
function serialize(income: Income) {
  return {
    id: income.id,
    amount: Number(income.amount),
    source: income.source,
    note: income.note,
    date: income.date.toISOString(),
    createdAt: income.createdAt.toISOString(),
    updatedAt: income.updatedAt.toISOString(),
  };
}
