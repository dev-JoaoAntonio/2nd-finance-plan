import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategorizationService } from '../categorization/categorization.service';
import { monthRange } from '../common/month-range';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';

const expenseInclude = {
  category: { select: { id: true, name: true, color: true, icon: true } },
} satisfies Prisma.ExpenseInclude;

type ExpenseWithCategory = Prisma.ExpenseGetPayload<{
  include: typeof expenseInclude;
}>;

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categorization: CategorizationService,
  ) {}

  async findAll(userId: string, query: QueryExpenseDto) {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (query.month) {
      const { start, end } = monthRange(query.month);
      where.date = { gte: start, lt: end };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: expenseInclude,
    });
    return expenses.map(serialize);
  }

  async create(userId: string, dto: CreateExpenseDto) {
    let categoryId = dto.categoryId ?? null;
    let autoCategorized = false;

    if (categoryId) {
      await this.ensureCategoryOwned(userId, categoryId);
    } else {
      categoryId = await this.categorization.suggestCategoryId(
        userId,
        dto.description,
      );
      autoCategorized = categoryId !== null;
    }

    const expense = await this.prisma.expense.create({
      data: {
        userId,
        categoryId,
        amount: new Prisma.Decimal(dto.amount),
        description: dto.description.trim(),
        date: new Date(dto.date),
        note: dto.note?.trim() || null,
      },
      include: expenseInclude,
    });

    return { ...serialize(expense), autoCategorized };
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.ensureExpenseOwned(userId, id);

    const data: Prisma.ExpenseUpdateInput = {};
    if (dto.amount !== undefined) data.amount = new Prisma.Decimal(dto.amount);
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.note !== undefined) data.note = dto.note?.trim() || null;

    if (dto.clearCategory) {
      data.category = { disconnect: true };
    } else if (dto.categoryId !== undefined) {
      await this.ensureCategoryOwned(userId, dto.categoryId);
      data.category = { connect: { id: dto.categoryId } };
    }

    const expense = await this.prisma.expense.update({
      where: { id },
      data,
      include: expenseInclude,
    });
    return serialize(expense);
  }

  async remove(userId: string, id: string) {
    await this.ensureExpenseOwned(userId, id);
    await this.prisma.expense.delete({ where: { id } });
    return { ok: true };
  }

  /** Reaplica as regras de categorização aos gastos do usuário que estão sem categoria. */
  async recategorize(userId: string) {
    const uncategorized = await this.prisma.expense.findMany({
      where: { userId, categoryId: null },
      select: { id: true, description: true },
    });

    let updated = 0;
    for (const exp of uncategorized) {
      const categoryId = await this.categorization.suggestCategoryId(
        userId,
        exp.description,
      );
      if (categoryId) {
        await this.prisma.expense.update({
          where: { id: exp.id },
          data: { categoryId },
        });
        updated++;
      }
    }
    return { updated };
  }

  private async ensureCategoryOwned(userId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { userId: true },
    });
    if (!category || category.userId !== userId) {
      throw new BadRequestException('Categoria inválida.');
    }
  }

  private async ensureExpenseOwned(userId: string, id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Gasto não encontrado.');
    }
  }
}

/** Converte o Decimal do Prisma em number para o front consumir facilmente. */
function serialize(expense: ExpenseWithCategory) {
  return {
    id: expense.id,
    amount: Number(expense.amount),
    description: expense.description,
    date: expense.date.toISOString(),
    note: expense.note,
    categoryId: expense.categoryId,
    category: expense.category,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}
