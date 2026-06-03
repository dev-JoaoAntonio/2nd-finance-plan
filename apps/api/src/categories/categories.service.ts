import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateRuleDto } from './dto/create-rule.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista as categorias do usuário com suas regras e contagem de gastos. */
  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        rules: { orderBy: { keyword: 'asc' } },
        _count: { select: { expenses: true } },
      },
    });
  }

  async create(userId: string, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          userId,
          name: dto.name.trim(),
          color: dto.color,
          icon: dto.icon?.trim() || 'category',
          isDefault: false,
        },
        include: { rules: true, _count: { select: { expenses: true } } },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
      throw e;
    }
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.ensureOwned(userId, id);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          color: dto.color,
          icon: dto.icon?.trim(),
        },
        include: { rules: true, _count: { select: { expenses: true } } },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
      throw e;
    }
  }

  async remove(userId: string, id: string) {
    await this.ensureOwned(userId, id);
    // Gastos ligados ficam com categoryId = null (onDelete: SetNull no schema).
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  async addRule(userId: string, categoryId: string, dto: CreateRuleDto) {
    await this.ensureOwned(userId, categoryId);
    return this.prisma.categoryRule.create({
      data: { categoryId, keyword: dto.keyword.toLowerCase().trim() },
    });
  }

  async removeRule(userId: string, ruleId: string) {
    const rule = await this.prisma.categoryRule.findUnique({
      where: { id: ruleId },
      include: { category: { select: { userId: true } } },
    });
    if (!rule || rule.category.userId !== userId) {
      throw new NotFoundException('Regra não encontrada.');
    }
    await this.prisma.categoryRule.delete({ where: { id: ruleId } });
    return { ok: true };
  }

  private async ensureOwned(userId: string, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { userId: true },
    });
    if (!category || category.userId !== userId) {
      throw new NotFoundException('Categoria não encontrada.');
    }
  }
}
