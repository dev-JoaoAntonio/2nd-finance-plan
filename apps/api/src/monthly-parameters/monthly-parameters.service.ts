import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toDateString, toNumber } from '../common/serialize';
import { UpsertMonthlyParameterDto } from './dto/upsert-monthly-parameter.dto';
import {
  CreateIncomeSourceDto,
  UpdateIncomeSourceDto,
} from './dto/income-source.dto';

@Injectable()
export class MonthlyParametersService {
  constructor(private readonly prisma: PrismaService) {}

  async latestMonth() {
    const [exp, param] = await Promise.all([
      this.prisma.expense.findFirst({
        orderBy: { referenceDate: 'desc' },
        select: { referenceDate: true },
      }),
      this.prisma.monthlyParameter.findFirst({
        orderBy: { referenceDate: 'desc' },
        select: { referenceDate: true },
      }),
    ]);
    const dates = [exp?.referenceDate, param?.referenceDate].filter(
      (d): d is Date => !!d,
    );
    if (dates.length === 0) return { month: null };
    const max = dates.reduce((a, b) => (a > b ? a : b));
    return { month: toDateString(max) };
  }

  async findOne(referenceDate: string) {
    const row = await this.prisma.monthlyParameter.findFirst({
      where: { referenceDate: new Date(referenceDate) },
    });
    if (!row) {
      return { id: null, baseIncome: 0, referenceDate };
    }
    return {
      id: row.id,
      baseIncome: toNumber(row.baseIncome),
      referenceDate: toDateString(row.referenceDate),
    };
  }

  async upsert(dto: UpsertMonthlyParameterDto) {
    const referenceDate = new Date(dto.referenceDate);
    const row = await this.prisma.monthlyParameter.upsert({
      where: { referenceDate },
      create: {
        referenceDate,
        baseIncome: new Prisma.Decimal(dto.baseIncome),
      },
      update: { baseIncome: new Prisma.Decimal(dto.baseIncome) },
    });
    return {
      id: row.id,
      baseIncome: toNumber(row.baseIncome),
      referenceDate: toDateString(row.referenceDate),
    };
  }

  async listIncomeSources(referenceDate: string) {
    const rows = await this.prisma.incomeSource.findMany({
      where: { referenceDate: new Date(referenceDate) },
      orderBy: { created_at: 'asc' },
    });
    return rows.map((s) => ({
      id: s.id,
      referenceDate: toDateString(s.referenceDate),
      description: s.description,
      amount: toNumber(s.amount),
    }));
  }

  async createIncomeSource(dto: CreateIncomeSourceDto) {
    const referenceDate = new Date(dto.referenceDate);
    const row = await this.prisma.incomeSource.create({
      data: {
        referenceDate,
        description: dto.description.trim(),
        amount: new Prisma.Decimal(dto.amount),
      },
    });
    await this.recalcBaseIncome(referenceDate);
    return this.serializeSource(row);
  }

  async updateIncomeSource(id: string, dto: UpdateIncomeSourceDto) {
    const existing = await this.prisma.incomeSource.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Fonte de renda não encontrada.');
    const data: Prisma.IncomeSourceUpdateInput = {};
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    const row = await this.prisma.incomeSource.update({ where: { id }, data });
    await this.recalcBaseIncome(existing.referenceDate);
    return this.serializeSource(row);
  }

  async deleteIncomeSource(id: string) {
    const existing = await this.prisma.incomeSource.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Fonte de renda não encontrada.');
    await this.prisma.incomeSource.delete({ where: { id } });
    await this.recalcBaseIncome(existing.referenceDate);
    return { success: true };
  }

  /** Soma as fontes do mês e grava (upsert) o baseIncome daquele mês. */
  private async recalcBaseIncome(referenceDate: Date) {
    const sources = await this.prisma.incomeSource.findMany({
      where: { referenceDate },
    });
    const total = sources.reduce((acc, s) => acc + toNumber(s.amount), 0);
    await this.prisma.monthlyParameter.upsert({
      where: { referenceDate },
      create: { referenceDate, baseIncome: new Prisma.Decimal(total) },
      update: { baseIncome: new Prisma.Decimal(total) },
    });
  }

  private serializeSource(s: {
    id: string;
    referenceDate: Date;
    description: string;
    amount: Prisma.Decimal;
  }) {
    return {
      id: s.id,
      referenceDate: toDateString(s.referenceDate),
      description: s.description,
      amount: toNumber(s.amount),
    };
  }
}
