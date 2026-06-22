import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Usuário único do app (personalização: troque username/name aqui).
const USERS = [{ username: 'valdeci', name: 'Valdeci' }];

// Categorias padrão de gastos (cores distintas p/ identificação nos gráficos).
const DEFAULT_CATEGORIES = [
  { name: 'Mercado', color: '#10b981' },
  { name: 'Comida', color: '#f97316' },
  { name: 'Transporte', color: '#0ea5e9' },
  { name: 'Lazer', color: '#a855f7' },
  { name: 'Saúde', color: '#ef4444' },
  { name: 'Contas', color: '#f59e0b' },
  { name: 'Educação', color: '#8b5cf6' },
  { name: 'Outros', color: '#64748b' },
];

async function main() {
  const password = process.env.SEED_PASSWORD || 'mudar123';
  const passwordHash = await bcrypt.hash(password, 10);

  for (const u of USERS) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { username: u.username, name: u.name, password: passwordHash },
    });
  }

  if ((await prisma.categories.count()) === 0) {
    for (const c of DEFAULT_CATEGORIES) {
      await prisma.categories.create({ data: { name: c.name, color: c.color } });
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Seed concluído: ${USERS.length} usuário(s), categorias garantidas.`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
