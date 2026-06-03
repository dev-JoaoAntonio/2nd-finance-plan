# 💰 Meu Planejador Financeiro

Sistema de planejamento financeiro pessoal com **foco em acessibilidade** (a usuária-alvo é idosa):
fonte grande e ajustável, alto contraste, navegação simples e linguagem clara.

A pessoa **cadastra seus gastos manualmente**, eles são **categorizados automaticamente** por
palavras-chave (com ajuste manual) e ela acompanha uma **análise** com dashboard, gráficos e tabelas.

## 🧱 Tecnologias

| Camada    | Stack                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| Front-end | Vue 3 + **Quasar** (Vite, TypeScript), Pinia, Vue Router, Axios, ApexCharts  |
| Back-end  | **NestJS** + **Prisma**, JWT (passport-jwt), bcryptjs, class-validator        |
| Banco     | **PostgreSQL** (Supabase)                                                    |
| Design    | Fundamentado na skill `ui-ux-pro-max` (tipografia Atkinson Hyperlegible, paleta de alto contraste, gráficos acessíveis) |

## 📁 Estrutura

```
.
├─ apps/
│  ├─ api/   → API NestJS + Prisma
│  └─ web/   → App Vue 3 + Quasar
├─ package.json   → scripts que rodam os dois apps juntos
└─ .claude/skills/ui-ux-pro-max/  → skill de UI/UX (versão fixa v2.5.0)
```

## ✅ Pré-requisitos

- Node.js 20+ (testado no 24)
- Uma conta/projeto no [Supabase](https://supabase.com) (free)

## 🚀 Como rodar

### 1. Banco de dados (Supabase)

1. Crie um projeto no Supabase.
2. Vá em **Project Settings → Database → Connection string** e copie:
   - **Connection pooling** (Transaction, porta **6543**) → vira `DATABASE_URL`
   - **Direct connection** (porta **5432**) → vira `DIRECT_URL`
3. Crie o arquivo `apps/api/.env` a partir do exemplo e preencha as strings:

   ```bash
   cp apps/api/.env.example apps/api/.env
   # edite apps/api/.env trocando [PROJECT-REF], [PASSWORD], [REGION] e o JWT_SECRET
   ```

### 2. Instalar dependências

```bash
npm run install:all
```

### 3. Criar as tabelas no banco

```bash
npm run prisma:migrate
```

> Isso roda a migration inicial e gera o Prisma Client. As categorias padrão
> (Alimentação, Moradia, Transporte, Saúde, etc.) são criadas automaticamente
> para **cada usuário** no momento do cadastro.

### 4. Rodar os dois apps

```bash
npm run dev
```

- API:  http://localhost:3000/api
- Web:  http://localhost:9000

Crie uma conta na tela inicial e comece a lançar seus gastos. 🎉

## 🔌 Principais endpoints da API (`/api`)

| Método | Rota                          | Descrição                                  |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/auth/register`              | Cria conta + semeia categorias padrão      |
| POST   | `/auth/login`                 | Login → `{ token, user }`                  |
| GET    | `/me`                         | Dados do usuário logado                    |
| GET    | `/categories`                 | Lista categorias + regras                  |
| POST   | `/categories`                 | Cria categoria                             |
| POST   | `/categories/:id/rules`       | Adiciona palavra-chave                     |
| GET    | `/expenses?month=AAAA-MM`     | Lista gastos (filtros: mês, categoria)     |
| POST   | `/expenses`                   | Cria gasto (auto-categoriza se sem categoria) |
| POST   | `/expenses/recategorize`      | Reaplica regras nos gastos sem categoria   |
| GET    | `/analytics/summary`          | Total do mês, comparação, maior categoria  |
| GET    | `/analytics/by-category`      | Gasto por categoria (%)                    |
| GET    | `/analytics/monthly-trend`    | Total dos últimos meses                    |

Todas as rotas (exceto `/auth/*`) exigem o header `Authorization: Bearer <token>`.

## ♿ Acessibilidade (decisões de design)

- **Fonte Atkinson Hyperlegible** (desenhada para máxima legibilidade).
- **Tema claro de alto contraste** (texto quase-preto sobre fundo claro, ≥ 4.5:1).
- **Ajuste de tamanho de letra** (A− / A+) persistente, no topo e na tela de conta.
- **Botões e alvos grandes** (≥ 48px), rótulos sempre com texto + ícone.
- **Gráfico de rosca sempre acompanhado de tabela** (não depende só de cor).
- Moeda em **R$** e datas no formato brasileiro.
