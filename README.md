# 💸 Finance Plan — Valdeci

Controle financeiro mensal: **renda** (com auditoria de fontes), **passivos fixos** (custos recorrentes), **transações** por categoria, uma **meta de longo prazo** com aportes/simulação e **conquistas**. Dashboard com KPIs, projeção, insights, gráficos de 12 meses e heatmap diário. Idioma pt-BR, moeda BRL. Estética editorial em **verde musgo + bege**.

> Reconstruído a partir do `BUILD_SPEC.md`, com 3 ajustes desta versão: **sem 2FA**, **meta de longo prazo genérica** (sem tema fixo) e **paleta verde/bege** (no lugar do rosa/azul).

## 🧱 Stack

| Camada | Tecnologias |
| --- | --- |
| Front | Vue 3 + Vite + **Tailwind**, Pinia, Vue Router, **Chart.js** (vue-chartjs), axios |
| Back | **NestJS** + **Prisma**, JWT (passport-jwt), bcryptjs, class-validator |
| Banco | **PostgreSQL** (Supabase/Neon/Railway) |
| Deploy | **Vercel** (1 projeto): web estático + API como função serverless |

Monorepo **npm workspaces**: `apps/web` (Vue) + `apps/api` (NestJS) + `api/index.ts` (entry serverless).

## 🚀 Rodar localmente

```bash
npm install
cp apps/api/.env.example apps/api/.env   # preencha DATABASE_URL / DIRECT_URL / JWT_SECRET
npm run prisma:generate
npm run prisma:migrate                   # (ou: npm run prisma:push) cria as tabelas
npm run prisma:seed                      # cria o usuário e categorias padrão
npm run dev                              # API :3000  ·  Web :5173 (proxy /api)
```

**Login inicial** (criado pelo seed): usuário `valdeci`, senha `mudar123` (mude depois em *Segurança*).

## ☁️ Deploy na Vercel (1 projeto)

O [vercel.json](vercel.json) já define tudo (build da API + web, função `api/index.ts`, rewrites SPA). Basta:

1. Importar o repositório na Vercel (**Root Directory = raiz**, Framework = *Other*).
2. Definir as variáveis: `DATABASE_URL` (pooler, :6543), `DIRECT_URL` (direto, :5432), `JWT_SECRET`, `JWT_EXPIRES_IN`.
3. Rodar as migrations uma vez contra o banco (`npm run prisma:migrate` / `prisma:deploy` local apontando para o Postgres) e o `prisma:seed`.

## ✏️ Personalização

- **Usuário/nome:** `apps/api/prisma/seed.ts`.
- **Título da meta de longo prazo:** `LONG_TERM_TITLE` em `apps/web/src/stores/finance.ts`.
- **Paleta:** `apps/web/tailwind.config.js` (chaves `sky` = verde, `pink` = bege) + botão de login em `LoginView.vue`.
- **Fotos do login:** `apps/web/public/login/*.svg` (são placeholders — troque por fotos reais).
- **Categorias padrão:** lista em `apps/api/prisma/seed.ts`.
