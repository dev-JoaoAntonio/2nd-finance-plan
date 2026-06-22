import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toDateString, toNumber } from '../common/serialize';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { UpsertContributionDto } from './dto/upsert-contribution.dto';

type GoalRow = {
  id: string;
  title: string;
  targetAmount: Prisma.Decimal;
  savedAmount: Prisma.Decimal | null;
  isPhase1: boolean | null;
  isCompleted: boolean | null;
  targetDate: Date | null;
};

function serialize(g: GoalRow) {
  return {
    id: g.id,
    title: g.title,
    targetAmount: toNumber(g.targetAmount),
    savedAmount: toNumber(g.savedAmount),
    isPhase1: g.isPhase1 ?? false,
    isCompleted: g.isCompleted ?? false,
    targetDate: g.targetDate ? toDateString(g.targetDate) : null,
  };
}

function firstOfMonthUTC(value: string): Date {
  const d = new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.goal.findMany({
      orderBy: { created_at: 'asc' },
    });
    return rows.map(serialize);
  }

  async create(dto: CreateGoalDto) {
    const row = await this.prisma.goal.create({
      data: {
        title: dto.title.trim(),
        targetAmount: new Prisma.Decimal(dto.targetAmount ?? 0),
        savedAmount: new Prisma.Decimal(dto.savedAmount ?? 0),
        isPhase1: dto.isPhase1 ?? true,
        isCompleted: dto.isCompleted ?? false,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      },
    });
    return serialize(row);
  }

  async update(id: string, dto: UpdateGoalDto) {
    await this.ensureExists(id);
    const data: Prisma.GoalUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.targetAmount !== undefined)
      data.targetAmount = new Prisma.Decimal(dto.targetAmount);
    if (dto.savedAmount !== undefined)
      data.savedAmount = new Prisma.Decimal(dto.savedAmount);
    if (dto.isPhase1 !== undefined) data.isPhase1 = dto.isPhase1;
    if (dto.isCompleted !== undefined) data.isCompleted = dto.isCompleted;
    if (dto.targetDate !== undefined)
      data.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
    const row = await this.prisma.goal.update({ where: { id }, data });
    return serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.goal.delete({ where: { id } });
    return { success: true };
  }

  async listContributions(goalId: string) {
    await this.ensureExists(goalId);
    const rows = await this.prisma.goalContribution.findMany({
      where: { goalId },
      orderBy: { referenceDate: 'desc' },
    });
    return rows.map((c) => ({
      id: c.id,
      goalId: c.goalId,
      referenceDate: toDateString(c.referenceDate),
      amount: toNumber(c.amount),
    }));
  }

  async upsertContribution(goalId: string, dto: UpsertContributionDto) {
    await this.ensureExists(goalId);
    const referenceDate = firstOfMonthUTC(dto.referenceDate);
    const amount = new Prisma.Decimal(dto.amount);
    const row = await this.prisma.goalContribution.upsert({
      where: { goalId_referenceDate: { goalId, referenceDate } },
      create: { goalId, referenceDate, amount },
      update: { amount },
    });
    return {
      id: row.id,
      goalId: row.goalId,
      referenceDate: toDateString(row.referenceDate),
      amount: toNumber(row.amount),
    };
  }

  async deleteContribution(goalId: string, referenceDate: string) {
    await this.ensureExists(goalId);
    const ref = firstOfMonthUTC(referenceDate);
    try {
      await this.prisma.goalContribution.delete({
        where: { goalId_referenceDate: { goalId, referenceDate: ref } },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Aporte não encontrado.');
      }
      throw e;
    }
    return { success: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.goal.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Meta ${id} não encontrada.`);
  }
}
