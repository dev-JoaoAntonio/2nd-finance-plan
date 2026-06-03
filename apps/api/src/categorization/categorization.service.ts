import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_CATEGORIES } from './default-categories';

@Injectable()
export class CategorizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria as categorias e regras padrão para um usuário recém-criado.
   * Idempotente: se o usuário já tem categorias, não faz nada.
   */
  async seedDefaults(userId: string): Promise<void> {
    const existing = await this.prisma.category.count({ where: { userId } });
    if (existing > 0) return;

    for (const def of DEFAULT_CATEGORIES) {
      await this.prisma.category.create({
        data: {
          userId,
          name: def.name,
          color: def.color,
          icon: def.icon,
          isDefault: true,
          rules: {
            create: def.keywords.map((keyword) => ({
              keyword: keyword.toLowerCase(),
            })),
          },
        },
      });
    }
  }

  /**
   * Sugere a categoria de um gasto a partir da descrição, casando palavras-chave
   * das regras do usuário (substring, case-insensitive). Retorna o id da categoria
   * ou `null` se nada casar (o chamador decide cair em "Outros").
   */
  async suggestCategoryId(
    userId: string,
    description: string,
  ): Promise<string | null> {
    const text = description.toLowerCase();

    const rules = await this.prisma.categoryRule.findMany({
      where: { category: { userId } },
      include: { category: { select: { id: true } } },
      orderBy: { keyword: 'desc' }, // palavras-chave mais longas primeiro (mais específicas)
    });

    for (const rule of rules) {
      if (rule.keyword && text.includes(rule.keyword)) {
        return rule.category.id;
      }
    }
    return null;
  }
}
