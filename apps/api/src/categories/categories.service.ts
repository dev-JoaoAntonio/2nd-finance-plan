import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

type CategoryRow = { id: string; name: string; color: string | null };

function serialize(c: CategoryRow) {
  return { id: c.id, name: c.name, color: c.color ?? null };
}

function normalizeColor(color?: string | null): string | null {
  if (!color) return null;
  const v = color.trim();
  if (!v) return null;
  return v.startsWith('#') ? v : `#${v}`;
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.categories.findMany({
      orderBy: { name: 'asc' },
    });
    return rows.map(serialize);
  }

  async create(dto: CreateCategoryDto) {
    const row = await this.prisma.categories.create({
      data: { name: dto.name.trim(), color: normalizeColor(dto.color) },
    });
    return serialize(row);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.ensureExists(id);
    const data: { name?: string; color?: string | null } = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.color !== undefined) data.color = normalizeColor(dto.color);
    const row = await this.prisma.categories.update({ where: { id }, data });
    return serialize(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    const inUse = await this.prisma.transaction.count({
      where: { categoryId: id },
    });
    if (inUse > 0) {
      throw new ConflictException(
        'Categoria em uso por transações. Remova ou recategorize-as antes.',
      );
    }
    try {
      await this.prisma.categories.delete({ where: { id } });
    } catch {
      throw new BadRequestException('Não foi possível remover a categoria.');
    }
    return { success: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.categories.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Categoria ${id} não encontrada.`);
  }
}
