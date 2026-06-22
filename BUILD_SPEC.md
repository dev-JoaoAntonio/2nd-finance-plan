Build Spec — Finance Plan (clone)
Cole este documento inteiro num chat do Claude Code dentro de um repositório vazio. Ele descreve, com precisão de reconstrução, um app de controle financeiro mensal para um casal. Construa-o exatamente como descrito. Onde houver dados pessoais (nomes, e-mails, título da meta), veja a seção 15. Personalização e troque pelos novos valores; o resto deve ser idêntico.

1. O que é o sistema
App web de controle financeiro mensal de um casal: receita do mês (com auditoria de fontes), passivos fixos (custos recorrentes), transações (gastos variáveis por categoria), uma meta de longo prazo com aportes mensais + simulação/trajetória, e conquistas (marcos). Dashboard com KPIs, projeções, gráficos de 12 meses e heatmap diário. Autenticação JWT com 2FA obrigatório (TOTP). Idioma pt-BR, moeda BRL. Estética "publicação impressa / editorial" em rosa + azul claro.

Arquitetura: monorepo npm workspaces com apps/web (Vue 3) + apps/api (NestJS + Prisma sobre Postgres) + entry serverless para deploy único na Vercel.

2. Stack e versões exatas
Raiz (package.json): name: finance-plan, version: 2.0.0, private, workspaces: ["apps/*"], engines.node >= 18.18.0. devDep: concurrently ^9.1.0. Scripts:


{
  "dev": "concurrently -n api,web -c magenta,cyan \"npm:dev:api\" \"npm:dev:web\"",
  "dev:api": "npm run start:dev --workspace apps/api",
  "dev:web": "npm run dev --workspace apps/web",
  "build": "npm run build --workspace apps/api && npm run build --workspace apps/web",
  "build:web": "npm run build --workspace apps/web",
  "build:api": "npm run build --workspace apps/api",
  "prisma:generate": "npm run prisma:generate --workspace apps/api",
  "prisma:pull": "npm run prisma:pull --workspace apps/api",
  "prisma:migrate": "npm run prisma:migrate --workspace apps/api",
  "prisma:seed": "npm run prisma:seed --workspace apps/api"
}
API (apps/api) — name: @finance-plan/api, version: 2.0.0. Scripts: build: nest build, start: node dist/main.js, start:dev: nest start --watch, start:prod: node dist/main.js, prisma:generate: prisma generate, prisma:pull: prisma db pull, prisma:push: prisma db push, prisma:migrate: prisma migrate dev, prisma:deploy: prisma migrate deploy, prisma:seed: prisma db seed. Bloco "prisma": { "seed": "ts-node prisma/seed.ts" }.

dependencies: @nestjs/common ^10.4.4, @nestjs/config ^3.2.3, @nestjs/core ^10.4.4, @nestjs/jwt ^10.2.0, @nestjs/passport ^10.0.3, @nestjs/platform-express ^10.4.4, @prisma/client ^5.22.0, bcryptjs ^2.4.3, class-transformer ^0.5.1, class-validator ^0.14.1, otplib ^12.0.1, passport ^0.7.0, passport-jwt ^4.0.1, qrcode ^1.5.4, reflect-metadata ^0.2.2, rxjs ^7.8.1.
devDependencies: @nestjs/cli ^10.4.5, @nestjs/schematics ^10.1.4, @types/bcryptjs ^2.4.6, @types/express ^4.17.21, @types/node ^20.14.10, @types/passport-jwt ^4.0.1, @types/qrcode ^1.5.6, prisma ^5.22.0, ts-node ^10.9.2, tsconfig-paths ^4.2.0, typescript ^5.5.4.
Web (apps/web) — name: @finance-plan/web, version: 2.0.0, type: module. Scripts: dev: vite, build: vue-tsc --noEmit && vite build, preview: vite preview.

dependencies: axios ^1.7.7, chart.js ^4.4.6, pinia ^2.2.6, vue ^3.5.13, vue-chartjs ^5.3.2, vue-router ^4.4.5.
devDependencies: @vitejs/plugin-vue ^5.2.0, autoprefixer ^10.4.20, postcss ^8.4.49, tailwindcss ^3.4.15, typescript ^5.6.3, vite ^5.4.11, vue-tsc ^2.1.10.
3. Estrutura de arquivos (árvore completa)

package.json
vercel.json
api/index.ts                         # entry serverless Vercel
apps/api/
  .env.example
  nest-cli.json
  package.json
  tsconfig.json
  tsconfig.build.json
  prisma/
    schema.prisma
    seed.ts
  src/
    main.ts
    serverless.ts
    app.module.ts
    common/serialize.ts
    prisma/{prisma.module.ts,prisma.service.ts}
    auth/{auth.controller.ts,auth.module.ts,auth.service.ts,jwt.constants.ts,
          jwt.strategy.ts,jwt-auth.guard.ts,public.decorator.ts,current-user.decorator.ts}
    auth/dto/{login.dto.ts,change-password.dto.ts,totp.dto.ts}
    categories/{categories.controller.ts,categories.module.ts,categories.service.ts}
    categories/dto/category.dto.ts
    expenses/{expenses.controller.ts,expenses.module.ts,expenses.service.ts}
    expenses/dto/{create-expense.dto.ts,update-expense.dto.ts}
    goals/{goals.controller.ts,goals.module.ts,goals.service.ts}
    goals/dto/{create-goal.dto.ts,update-goal.dto.ts,upsert-contribution.dto.ts}
    monthly-parameters/{*.controller.ts,*.module.ts,*.service.ts}
    monthly-parameters/dto/{upsert-monthly-parameter.dto.ts,income-source.dto.ts}
    transactions/{transactions.controller.ts,transactions.module.ts,transactions.service.ts}
    transactions/dto/transaction.dto.ts
apps/web/
  .env.example
  index.html
  postcss.config.js
  tailwind.config.js
  tsconfig.json
  vite.config.ts
  public/favicon.svg
  public/login/{main.jpeg,slide-2.jpeg,slide-3.jpeg,slide-4.jpeg}
  src/
    main.ts  App.vue  style.css  types.ts  vite-env.d.ts
    router/index.ts
    directives/reveal.ts
    services/{api.ts,auth.ts,finance.ts,transactions.ts,categories.ts}
    stores/{auth.ts,finance.ts,toast.ts}
    utils/{budget.ts,format.ts}
    components/  (31 componentes — ver seção 13)
    views/{DashboardView,ExpensesView,GoalsView,LoginView,ConfigView,SettingsView,SetupTwoFactorView}.vue
4. Banco de dados (Prisma) — modelo de dados
Contexto importante: no original o Postgres era do Supabase e várias tabelas (expenses, monthly_parameters, goals, goal_contributions, income_sources, categories, transactions) já existiam; só users foi criada pelo time. Para um repo novo do zero, simplesmente crie todo o schema com prisma migrate dev (ou db push). IDs são UUID. Colunas de dinheiro são Decimal e devem ser serializadas para number na API. Datas (reference_date, occurred_at, target_date) são @db.Date e trafegam como YYYY-MM-DD.

apps/api/prisma/schema.prisma:


generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]   // rhel = runtime Vercel/Lambda
}
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     // pooled (pgbouncer :6543) em runtime
  directUrl = env("DIRECT_URL")       // direto (:5432) p/ migrations
}

model Expense {
  id                String      @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  title             String
  description       String?
  amount            Decimal     @db.Decimal(10, 2)
  type              String      // 'fixed' | 'variable' (hoje só 'fixed' é usado)
  category_id       String?     @db.Uuid
  referenceDate     DateTime    @map("reference_date") @db.Date
  created_at        DateTime?   @default(now()) @db.Timestamptz(6)
  spentAmount       Decimal?    @default(0.00) @map("spent_amount") @db.Decimal(10, 2)
  sacrificePriority Int?        @default(5) @map("sacrifice_priority")
  categories        categories? @relation(fields: [category_id], references: [id], onUpdate: NoAction)
  @@map("expenses")
}
model MonthlyParameter {
  id            String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  referenceDate DateTime  @unique @map("reference_date") @db.Date
  baseIncome    Decimal   @map("base_income") @db.Decimal(10, 2)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  @@map("monthly_parameters")
}
model IncomeSource {
  id            String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  referenceDate DateTime  @map("reference_date") @db.Date
  description   String
  amount        Decimal   @db.Decimal(10, 2)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  @@index([referenceDate])
  @@map("income_sources")
}
model Goal {
  id            String             @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  title         String
  targetAmount  Decimal            @map("target_amount") @db.Decimal(10, 2)
  savedAmount   Decimal?           @default(0) @map("saved_amount") @db.Decimal(10, 2)
  isPhase1      Boolean?           @default(false) @map("is_phase_1")
  isCompleted   Boolean?           @default(false) @map("is_completed")
  targetDate    DateTime?          @map("target_date") @db.Date
  created_at    DateTime?          @default(now()) @db.Timestamptz(6)
  contributions GoalContribution[]
  @@map("goals")
}
model GoalContribution {
  id            String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  goalId        String    @map("goal_id") @db.Uuid
  referenceDate DateTime  @map("reference_date") @db.Date
  amount        Decimal   @db.Decimal(12, 2)
  created_at    DateTime? @default(now()) @db.Timestamptz(6)
  goal          Goal      @relation(fields: [goalId], references: [id], onDelete: Cascade, onUpdate: NoAction)
  @@unique([goalId, referenceDate])
  @@index([goalId])
  @@map("goal_contributions")
}
model categories {                  // modelo minúsculo, SEM @@map → tabela "categories"
  id           String        @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  name         String
  color        String?
  created_at   DateTime?     @default(now()) @db.Timestamptz(6)
  expenses     Expense[]
  transactions Transaction[]
}
model Transaction {
  id          String     @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  amount      Decimal    @db.Decimal(10, 2)
  description String?
  occurredAt  DateTime   @map("occurred_at") @db.Date
  categoryId  String     @map("category_id") @db.Uuid
  category    categories @relation(fields: [categoryId], references: [id], onDelete: Restrict, onUpdate: NoAction)
  createdAt   DateTime?  @default(now()) @map("created_at") @db.Timestamptz(6)
  @@index([occurredAt])
  @@index([categoryId])
  @@map("transactions")
}
model User {
  id          String   @id @default(uuid()) @db.Uuid
  username    String   @unique
  name        String?
  password    String
  totpSecret  String?  @map("totp_secret")
  totpEnabled Boolean  @default(false) @map("totp_enabled")
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("users")
}
Se criar do zero (sem uuid_generate_v4() do Postgres disponível), troque os @default(dbgenerated("uuid_generate_v4()")) por @default(uuid()) ou habilite a extensão uuid-ossp.

common/serialize.ts (usado por TODOS os services):


export function toNumber(value, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  return typeof value === 'number' ? value : Number(value.toString());  // Prisma.Decimal → number
}
export function toDateString(value: Date): string { return value.toISOString().slice(0, 10); } // 'YYYY-MM-DD'
5. Backend — bootstrap, módulos e regras transversais
Bootstrap (idêntico em dois entrypoints)
main.ts (local): cria app Nest, app.setGlobalPrefix('api'), app.enableCors({ origin: true, credentials: true }), app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false })), porta process.env.PORT ?? 3000, app.listen(port), log API rodando em http://localhost:${port}/api.

serverless.ts (Vercel): mesma config mas sobre ExpressAdapter, cacheando o app Express num módulo-singleton (let cachedApp), usando await app.init() (não listen) e retornando o handler Express.


let cachedApp;
export async function bootstrapServer() {
  if (cachedApp) return cachedApp;
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }));
  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}
api/index.ts (raiz): import { bootstrapServer } from '../apps/api/dist/serverless'; exporta default async (req,res) => (await bootstrapServer())(req,res). Importa o dist compilado → build:api precede o deploy.

app.module.ts

imports: [ ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule,
  CategoriesModule, ExpensesModule, GoalsModule, MonthlyParametersModule, TransactionsModule ],
providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
Guard JWT global: toda rota é protegida exceto as marcadas @Public().

PrismaModule / PrismaService
@Global(), provê/exporta PrismaService extends PrismaClient implements OnModuleInit. onModuleInit() faz try { await this.$connect() } catch { Logger.warn(...) } (não derruba o processo se o DB estiver indisponível no boot).

Regras transversais a replicar
Decimal → number em todo serializer via toNumber (null → 0). A API nunca devolve objeto Decimal.
Datas: saída via toDateString; entrada via new Date('YYYY-MM-DD') (meia-noite UTC). DTOs validam com @Matches(/^\d{4}-\d{2}-\d{2}$/) ou @IsDateString().
Filtros por mês são intervalo semiaberto [from, to) com gte/lt.
Aportes de meta: referenceDate é normalizado para o 1º dia do mês em UTC antes de upsert/delete (chave única goalId_referenceDate) → 1 aporte por meta por mês.
6. Backend — Auth (detalhado)
auth.module.ts: PassportModule + JwtModule.registerAsync com useFactory(config) → { secret: resolveJwtSecret(config), signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') || '7d' } }. Providers: AuthService, JwtStrategy.
jwt.constants.ts: resolveJwtSecret(config) retorna JWT_SECRET ou, se ausente, loga warning e usa fallback 'dev-insecure-jwt-secret-change-me'. O mesmo resolver é usado para assinar e verificar.
jwt.strategy.ts: JwtPayload = { sub, username, name? }; ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: resolveJwtSecret. validate(payload) → { id: sub, username, name } (vira request.user).
jwt-auth.guard.ts: extends AuthGuard('jwt'); em canActivate, lê metadata IS_PUBLIC_KEY via Reflector.getAllAndOverride (handler+classe); se público retorna true, senão super.canActivate.
public.decorator.ts: IS_PUBLIC_KEY = 'isPublic'; Public = () => SetMetadata(IS_PUBLIC_KEY, true).
current-user.decorator.ts: CurrentUser = createParamDecorator((_d, ctx) => ctx.switchToHttp().getRequest().user).
auth.service.ts (constantes: TOTP_ISSUER='Finance Plan'; authenticator.options = { window: 1 }; hash bcryptjs custo 10):

login(dto): user = prisma.user.findUnique({ where: { username: dto.username.toLowerCase().trim() } }). Se não existe ou !bcrypt.compare(dto.password, user.password) → Unauthorized('Usuário ou senha inválidos.'). Se user.totpEnabled: sem dto.token → Unauthorized({ code:'TOTP_REQUIRED', message:'Código de autenticação obrigatório.' }); com token inválido (authenticator.verify) → Unauthorized({ code:'TOTP_INVALID', message:'Código de autenticação inválido.' }). Sucesso → buildSession.
buildSession(user): payload { sub:id, username, name }, access_token = jwt.signAsync(payload), retorna { access_token, user: publicUser }. publicUser = { id, username, name, totpEnabled } (nunca senha/secret).
me(userId): findUnique; ausente → Unauthorized; retorna publicUser.
changePassword(userId, dto): valida bcrypt.compare(currentPassword) (erro 'Senha atual incorreta.'), grava bcrypt.hash(newPassword, 10). Retorna { success: true }.
setupTotp(userId): secret = authenticator.generateSecret(); grava { totpSecret: secret, totpEnabled: false }; otpauth = authenticator.keyuri(username, 'Finance Plan', secret); qrDataUrl = await QRCode.toDataURL(otpauth). Retorna { qrDataUrl, secret }.
enableTotp(userId, token): sem secret → BadRequest('Inicie a configuração do 2FA primeiro.'); token inválido → BadRequest('Código inválido. Tente novamente.'); grava totpEnabled: true. { success: true }.
disableTotp(userId, password): valida senha ('Senha incorreta.'), grava { totpEnabled:false, totpSecret:null }. { success: true }.
Rotas auth (prefixo /api/auth):

Método	Rota	Auth	Body	Retorno
POST	/auth/login	@Public() @HttpCode(200)	LoginDto	{ access_token, user }
GET	/auth/me	JWT	—	publicUser
POST	/auth/change-password	JWT @HttpCode(200)	ChangePasswordDto	{ success:true }
POST	/auth/totp/setup	JWT @HttpCode(200)	—	{ qrDataUrl, secret }
POST	/auth/totp/enable	JWT @HttpCode(200)	TotpTokenDto	{ success:true }
POST	/auth/totp/disable	JWT @HttpCode(200)	DisableTotpDto	{ success:true }
7. Backend — módulos de domínio (rotas + lógica)
Todas as rotas têm prefixo /api e exigem JWT (guard global). Cada service tem serialize() que converte Decimal→number e Date→YYYY-MM-DD.

Categories — prefixo categories
Método	Rota	Body	Service
GET	/categories	—	findAll → findMany({ orderBy:{ name:'asc' } })
POST	/categories	CreateCategoryDto	create (name.trim, color normalizado)
PATCH	/categories/:id	UpdateCategoryDto	update (spread condicional)
DELETE	/categories/:id	—	remove
serialize(c) = { id, name, color: c.color ?? null }. normalizeColor: vazio→null; senão prefixa # se faltar.
remove: ensureExists; inUse = transaction.count({ where:{ categoryId:id } }); se >0 → Conflict('Categoria em uso por transações. ...'); senão delete (catch → BadRequest('Não foi possível remover a categoria.')). ensureExists → NotFound('Categoria ${id} não encontrada.').
Expenses — prefixo expenses
Método	Rota	Query/Param	Body	Service
GET	/expenses	?referenceDate?	—	findAll
POST	/expenses	—	CreateExpenseDto	create
PATCH	/expenses/:id	id	UpdateExpenseDto	update
DELETE	/expenses/:id	id	—	remove
serialize(e) = { id, title, description, amount: toNumber, spentAmount: toNumber, type, sacrificePriority: e.sacrificePriority ?? 5, referenceDate: toDateString }.
findAll(referenceDate?): se referenceDate, primeiro ensureFixedForMonth(referenceDate); where = referenceDate ? { referenceDate: new Date(referenceDate) } : {}; findMany({ where, orderBy:{ created_at:'asc' } }).
ensureFixedForMonth(date) (passivos fixos auto-recorrentes): se já existem fixos no mês, retorna. Senão acha o mês anterior mais recente com fixos (findFirst type:'fixed', referenceDate:{ lt:date }, orderBy desc), clona todos eles para o mês atual via createMany (copiando title/description/amount/type/sacrificePriority/category_id, referenceDate: date, spentAmount resetado para 0).
create: description ?? null, spentAmount ?? 0, sacrificePriority ?? 5, referenceDate: new Date(dto.referenceDate). ensureExists → NotFound('Despesa ${id} não encontrada.').
Transactions — prefixo transactions
Método	Rota	Query/Param	Body	Service
GET	/transactions	?from? ?to?	—	findAll (intervalo [from,to))
GET	/transactions/summary	?from ?to	—	summaryByCategory
GET	/transactions/monthly-history	?months (DefaultValuePipe(12),ParseIntPipe)	—	monthlyHistory
POST	/transactions	—	CreateTransactionDto	create
PATCH	/transactions/:id	id	UpdateTransactionDto	update
DELETE	/transactions/:id	id	—	remove
Helpers UTC: monthStart(d)=Date.UTC(y,m,1); monthLabel(d)='YYYY-MM-01'; addMonths(d,n).
serialize(t) = { id, amount: toNumber, description, occurredAt: toDateString, categoryId, category:{ id,name,color } }.
findAll: where com occurredAt.gte = new Date(from) e/ou .lt = new Date(to); include:{ category:true }, orderBy:[{ occurredAt:'desc' },{ createdAt:'desc' }].
create: description: dto.description?.trim() || null, occurredAt: new Date(...), include category.
summaryByCategory(from,to): findMany em [from,to) com category; reduz em Map<catId,{id,name,color,total,count}>; retorna array ordenado por total desc.
monthlyHistory(months=12): end = monthStart(addMonths(now,1)), start = addMonths(end,-months). Promise.all de: transações em [start,end) c/ category; despesas fixas (type:'fixed', referenceDate ∈ [start,end)) selecionando referenceDate,spentAmount,title; monthly parameters em [start,end) (referenceDate,baseIncome). Pré-cria months buckets vazios keyed por monthLabel. Para cada transação: b.transactions += amount + acumula em catMap {name,color,total}. Fixas: b.fixed += toNumber(spentAmount); se amount>0 push {title,amount} em fixedList. Params: b.income = baseIncome. Retorna { month, transactions, fixed, income, transactionsBreakdown(sorted desc), fixedBreakdown(sorted desc) }[].
Goals — prefixo goals
Método	Rota	Body	Service
GET	/goals	—	findAll (orderBy created_at asc)
POST	/goals	CreateGoalDto	create
PATCH	/goals/:id	UpdateGoalDto	update
DELETE	/goals/:id	—	remove
GET	/goals/:id/contributions	—	listContributions
PUT	/goals/:id/contributions	UpsertContributionDto	upsertContribution
DELETE	/goals/:id/contributions/:referenceDate	—	deleteContribution
serialize(g) = { id, title, targetAmount: toNumber, savedAmount: toNumber, isPhase1: g.isPhase1 ?? false, isCompleted: g.isCompleted ?? false, targetDate: g.targetDate ? slice(0,10) : null }.
create: title.trim, targetAmount ?? 0, savedAmount ?? 0, isPhase1: dto.isPhase1 ?? true (atenção: default true no service, embora a coluna seja false), isCompleted ?? false, targetDate → Date|null.
upsertContribution(goalId, dto): normaliza referenceDate p/ 1º dia do mês UTC; goalContribution.upsert({ where:{ goalId_referenceDate:{ goalId, referenceDate } }, create:{...}, update:{ amount } }).
deleteContribution: normaliza; delete em try/catch (P2025 → NotFound('Aporte não encontrado.')). ensureExists → NotFound('Meta ${id} não encontrada.').
Monthly Parameters — prefixo monthly-parameters
Método	Rota	Query/Param	Body	Service
GET	/monthly-parameters/latest-month	—	—	latestMonth
GET	/monthly-parameters	?referenceDate	—	findOne
PUT	/monthly-parameters	—	UpsertMonthlyParameterDto	upsert
GET	/monthly-parameters/income-sources	?referenceDate	—	listIncomeSources
POST	/monthly-parameters/income-sources	—	CreateIncomeSourceDto	createIncomeSource
PATCH	/monthly-parameters/income-sources/:id	id	UpdateIncomeSourceDto	updateIncomeSource
DELETE	/monthly-parameters/income-sources/:id	id	—	deleteIncomeSource
serialize(p) = { id, baseIncome: toNumber, referenceDate: toDateString }.
latestMonth(): max(referenceDate) entre expense.findFirst desc e monthlyParameter.findFirst desc; { month: 'YYYY-MM-DD' | null }.
findOne(referenceDate): findFirst({ where:{ referenceDate:new Date } }); ausente → sintético { id:null, baseIncome:0, referenceDate } (sem gravar).
upsert(dto): find por referenceDate; existe → update baseIncome; senão create.
recalcBaseIncome(date) (efeito colateral das fontes): soma incomeSource.amount do mês; atualiza/cria o monthlyParameter.baseIncome daquele mês. Chamado em create/update/delete de income source. → editar fontes deriva o baseIncome automaticamente.
8. Backend — DTOs (validators exatos, class-validator)
LoginDto: username @IsString @IsNotEmpty; password @IsString @IsNotEmpty @MinLength(4); token? @IsOptional @Matches(/^\d{6}$/, {message:'O código 2FA deve ter 6 dígitos.'}).
ChangePasswordDto: currentPassword @IsString @IsNotEmpty; newPassword @IsString @MinLength(6, {message:'A nova senha deve ter ao menos 6 caracteres.'}).
TotpTokenDto: token @Matches(/^\d{6}$/, {message:'O código deve ter 6 dígitos.'}). DisableTotpDto: password @IsString @IsNotEmpty.
CreateCategoryDto: name @IsString @IsNotEmpty; color? @IsOptional @Matches(/^#?[0-9a-fA-F]{6}$/, {message:'color deve ser um hex (#RRGGBB)'}). UpdateCategoryDto: ambos opcionais.
CreateExpenseDto: title @IsString @IsNotEmpty; description? @IsOptional @IsString; amount @IsNumber @Min(0); spentAmount? @IsOptional @IsNumber @Min(0); type @IsIn(['fixed','variable']); sacrificePriority? @IsOptional @IsInt; referenceDate @Matches(/^\d{4}-\d{2}-\d{2}$/, {message:'referenceDate deve estar no formato YYYY-MM-DD'}). UpdateExpenseDto: todos opcionais.
CreateTransactionDto: amount @IsNumber @Min(0); categoryId @IsUUID; occurredAt @Matches(DATE_RE, {message:'occurredAt deve estar no formato YYYY-MM-DD'}); description? @IsOptional @IsString. UpdateTransactionDto: todos opcionais.
CreateGoalDto: title @IsString @IsNotEmpty; targetAmount? @IsOptional @IsNumber @Min(0); savedAmount? @IsOptional @IsNumber @Min(0); isPhase1? @IsOptional @IsBoolean; isCompleted? @IsOptional @IsBoolean; targetDate? @IsOptional @ValidateIf((_o,v)=>v!==null) @IsDateString (tipo string|null). UpdateGoalDto: idem, title? com @IsOptional @IsString @IsNotEmpty.
UpsertContributionDto: referenceDate @IsDateString; amount @IsNumber @Min(0).
UpsertMonthlyParameterDto: baseIncome @IsNumber @Min(0); referenceDate @Matches(/^\d{4}-\d{2}-\d{2}$/, ...).
CreateIncomeSourceDto: referenceDate @IsDateString; description @IsString @IsNotEmpty; amount @IsNumber @Min(0). UpdateIncomeSourceDto: description?/amount? opcionais.
9. Backend — seed e env
seed.ts: new PrismaClient() + bcryptjs. password = process.env.SEED_PASSWORD || 'mudar123', hash custo 10. Faz prisma.user.upsert (por username) de dois usuários: {username:'ana', name:'Ana'} e {username:'joao', name:'João'}. Se categories.count() === 0, cria categorias padrão: Mercado #10b981, Comida #f97316, Transporte #0ea5e9, Lazer #ec4899, Saúde #ef4444, Contas #f59e0b, Educação #8b5cf6, Outros #64748b. Wrapper main().catch(exit 1).finally($disconnect).

.env.example (api):


DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"   # pooled (runtime)
DIRECT_URL="postgresql://...:5432/postgres"                    # direto (migrations)
JWT_SECRET="troque-por-um-segredo-forte-e-aleatorio"
JWT_EXPIRES_IN="7d"
SEED_PASSWORD="mudar123"
.env.example (web): VITE_API_URL="/api".

nest-cli.json: { "$schema":"https://json.schemastore.org/nest-cli", "collection":"@nestjs/schematics", "sourceRoot":"src", "compilerOptions":{ "deleteOutDir": true } }. tsconfig (api): commonjs, ES2021, decorators on, outDir: ./dist, strictNullChecks: true, noImplicitAny: false, include src/**/* + prisma/**/*. tsconfig.build.json exclui test, prisma/seed.ts, **/*spec.ts.

10. Frontend — wiring, config e design system
Config
vite.config.ts: plugin vue; alias @ → ./src; server.port: 5173; proxy /api → http://localhost:3000 (changeOrigin: true).
postcss.config.js: tailwindcss + autoprefixer. tailwind.config.js: ver tokens abaixo. tsconfig.json Vue padrão com path @/*.
index.html (lang="pt-BR", title Finance Plan · Ana & João, favicon /favicon.svg): carrega Google Fonts Poppins (300–900, itálicos) e Material Symbols Rounded (opsz,wght,FILL,GRAD@20..48,400..700,0..1,-25..200).
main.ts: createApp(App) + createPinia() + router + app.directive('reveal', vReveal) + import './style.css' + mount #app.
Tailwind tokens (tailwind.config.js)
content: ['./index.html','./src/**/*.{vue,ts}']. theme.extend:

fontFamily.sans e fontFamily.mono = ['Poppins','system-ui','sans-serif'] (⚠️ font-mono ainda é Poppins — usado para números tabulares).
colors.paper: DEFAULT #fbfaf5, cream #f5f1e7, cool #f1f5fa, warm #faf6ec.
colors.line: DEFAULT #e3deca, strong #c9c2a4. colors.night: #0a0e1a.
colors.ink: DEFAULT #0a1020, 2 #475569, 3 #94a3b8, 4 #cbd5e1, 50 #f7f6f1, 100 #eeece4, 200 #e5e7eb, 300 #cbd5e1, 400 #94a3b8, 500 #64748b, 600 #475569, 700 #334155, 800 #1e293b, 900 #0a1020.
colors.sky: 50 #eaf3fc,100 #d5e9fb,200 #b5d8f9,300 #5eb3ff,400 #2f9ff0,500 #0e8fe6,600 #0078db,700 #0a5fae.
colors.pink: 50 #fdf2f8,100 #fce7f3,200 #fbcfe8,300 #f9a8d4,400 #f472b6,500 #ec4899,600 #db2777,700 #be185d.
boxShadow.soft = 0 1px 2px 0 rgba(15,23,42,.04), 0 1px 3px -1px rgba(15,23,42,.06); boxShadow.card = 0 1px 3px 0 rgba(15,23,42,.06), 0 10px 25px -16px rgba(15,23,42,.25); boxShadow.pop = 0 20px 50px -22px rgba(15,23,42,.35).
borderRadius.lg = 0.375rem, xl = 0.5rem, 2xl = 0.625rem (⚠️ rounded-2xl ≈ 10px). letterSpacing.tightest = -0.06em. plugins: [].
style.css (classes globais — OBRIGATÓRIAS)
@layer base: body { @apply bg-slate-50 font-sans text-ink-700 antialiased } + força Poppins em body *:not(.material-symbols-rounded). Checkbox custom 18×18 (appearance:none, checado = border-sky-600 bg-sky-600 com SVG de check branco inline, :active scale(0.92)). .material-symbols-rounded { font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24 }. Scrollbar 9px (#cbd5e1→#94a3b8).
@layer components:


.card        → rounded-2xl border border-ink-200 bg-white shadow-soft
.input       → w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-ink-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100
.btn         → inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
.btn-primary → .btn bg-sky-600 text-white hover:bg-sky-700
.btn-ghost   → .btn border border-ink-200 bg-white text-ink-700 hover:bg-slate-50
.btn-danger  → .btn bg-pink-600 text-white hover:bg-pink-700
.label       → mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-500
.kicker      → text-[11px] font-semibold uppercase tracking-wider text-sky-600
.display     → font-extrabold leading-tight tracking-tight text-ink-900
.rule        → border-t border-ink-200
.page-no     → text-[11px] font-semibold tracking-wider text-ink-3
.section-tag → inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500
Animação reveal (CSS): .reveal { opacity:0; filter:blur(8px); transform:translateY(14px); transition: opacity .55s ease, filter .55s ease, transform .55s cubic-bezier(0.34,1.4,0.64,1); transition-delay: var(--reveal-delay,0ms) } ; .reveal-in { opacity:1; filter:blur(0); transform:none }. Respeita prefers-reduced-motion.

directives/reveal.ts
vReveal: Directive<HTMLElement, { delay?: number }>. beforeMount: add classe reveal; se binding.value?.delay, set --reveal-delay: ${delay}ms. mounted: IntersectionObserver({ threshold: 0.08 }), ao intersectar add reveal-in e unobserve. Uso: v-reveal / v-reveal="{ delay: 80 }".

utils/format.ts
formatCurrency(n) → toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) (ex.: R$ 1.234,56).
formatDecimal(n) → toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).
parseInput(str) → remove tudo exceto [\d,-], troca ,→., parseFloat (|| 0).
formatMonthLabel('YYYY-MM-DD') → "Maio de 2026" (mês por extenso + ano, 1ª letra maiúscula).
utils/budget.ts — computeBudgets(expenses) (regra de "sacrifício")
Para cada despesa: balance = amount - spentAmount, adjusted = balance. totalOverage = soma dos balances negativos (valor absoluto). Se >0, ordena as despesas com balance>0 por sacrificePriority desc (maior prioridade de sacrifício primeiro) e vai abatendo adjusted até zerar o overage (cruza categorias). Retorna ComputedExpense[] com { ...e, balance, adjusted }.

types.ts (interfaces compartilhadas)
ExpenseType='fixed'|'variable'; Expense{ id,title,description|null,amount,spentAmount,type,sacrificePriority,referenceDate }; ComputedExpense extends Expense { balance, adjusted }; Goal{ id,title,targetAmount,savedAmount,isPhase1,isCompleted,targetDate|null }; GoalContribution{ id,goalId,referenceDate,amount }; MonthlyParameter{ id|null,baseIncome,referenceDate }; IncomeSource{ id,referenceDate,description,amount }; Category{ id,name,color|null }; Transaction{ id,amount,description|null,occurredAt,categoryId,category }; CategorySummary{ id,name,color|null,total,count }; MonthlyCategoryBreakdown{ name,color|null,total }; MonthlyFixedBreakdown{ title,amount }; MonthlyTotal{ month,transactions,fixed,income,transactionsBreakdown[],fixedBreakdown[] }; AuthUser{ id,username,name?,totpEnabled? }; LoginResponse{ access_token,user }.

Camada de serviços (axios)
services/api.ts: axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' }). TOKEN_KEY='fp_token'; getToken/setToken em localStorage. Request interceptor anexa Authorization: Bearer <token>. Response interceptor: em 401 limpa fp_token e fp_user e, se não estiver em /login, redireciona via window.location.assign('/login').
services/auth.ts: login(username,password,token?) → POST /auth/login; me() GET /auth/me; changePassword, setupTotp POST /auth/totp/setup → {qrDataUrl,secret}, enableTotp(token), disableTotp(password).
services/finance.ts: expenses (list ?referenceDate, create, update, delete), goals (list/create/update/delete), contributions (list/upsert PUT/delete), monthly-parameters (getLatestMonth, getMonthlyParameter, upsertMonthlyParameter), income-sources (list/create/update/delete). ExpenseInput{ title,description?,amount,spentAmount?,type,sacrificePriority?,referenceDate }.
services/transactions.ts: list(from?,to?), create, update, remove, summary(from,to), monthlyHistory(months=12). TransactionInput{ amount,categoryId,occurredAt,description? }.
services/categories.ts: list/create/update/remove.
Stores (Pinia, setup-style)
stores/auth.ts ('auth'): state user (de localStorage 'fp_user'), token (de getToken). isAuthenticated = !!token. persistUser, login (grava token+user), logout, refreshUser (authService.me), changePassword, setupTotp, enableTotp/disableTotp (chamam refreshUser depois).
stores/toast.ts ('toast'): ToastType='success'|'error'|'info'; toasts[]; push(type,message,timeout=3500) auto-remove via setTimeout; helpers success/error/info.
stores/finance.ts ('finance'): núcleo do app. Ver seção 11.
11. Frontend — store finance (lógica de negócio do cliente)
Constante LONG_TERM_TITLE = 'Mudança EUA'. Helpers currentMonthStart() (1º dia do mês atual YYYY-MM-01), shiftMonth(ref, delta).

State: currentMonth (init currentMonthStart), expenses (só fixos), goals, income, loading, initialized, transactions, categories, summary, monthlyHistory (12 meses), goalContributions, incomeSources.

Getters:

computedExpenses = computeBudgets(expenses); fixedExpenses = computedExpenses.
fixedPlanned = Σ amount; fixedSpent = Σ spentAmount; transactionsTotal = Σ transactions.amount; totalSpent = fixedSpent + transactionsTotal; available = income - totalSpent.
longTermGoal = goal com title === 'Mudança EUA' ou o primeiro com !isPhase1; longTerm = { saved, target, targetDate }; longTermPct = clamp(saved/target*100, 0..100).
achievements = goals.filter(isPhase1).
savingsRate = max(0, (income - totalSpent)/income) (0 se income≤0).
projection: só no mês corrente e se totalSpent>0; (totalSpent/dia_atual) * dias_no_mês; senão null.
topTransactions = top 5 por amount desc.
currentHistoryEntry, previousHistoryEntry; deltas totalSpentDelta/fixedSpentDelta/transactionsDelta (variação % vs mês anterior) e savingsRateDelta (diferença absoluta em pontos percentuais).
sparkFixed/sparkTx/sparkAvailable/sparkSavings = últimos 6 valores do histórico para cada métrica.
dailyMap: Record<'YYYY-MM-DD', total> das transações do mês.
insights: até 4 frases automáticas pt-BR: maior categoria do mês; categoria que subiu >15% ("X subiu N% vs mês passado." kind warn); categoria que caiu >10% ("Você gastou N% menos em X." kind good); taxa de poupança (≥20% good "ritmo forte!", 0–10% warn "sobra apertada.", ≤0 warn "Gastos do mês superaram a renda.").
Actions: init() (carrega categories, monthlyHistory(12), loadMonth, refreshContributions; idempotente via initialized). loadMonth() (Promise.all: listExpenses, getMonthlyParameter, listGoals, transactions.list[from,to], summary, listIncomeSources; filtra expenses para só type==='fixed'; income = param.baseIncome). setMonth/prevMonth/nextMonth. Despesas: createExpense (força type:'fixed', referenceDate: currentMonth), updateExpense, updateSpent, deleteExpense. Renda: saveIncome. Fontes: addIncomeSource/updateIncomeSource/deleteIncomeSource (recalculam income somando fontes + refreshHistory). Conquistas: addAchievement(title) (cria goal isPhase1:true, targetAmount:0), toggleAchievement, deleteGoal. Meta longo prazo: updateLongTerm({saved?,target?,targetDate?}) (update ou cria goal Mudança EUA isPhase1:false). Aportes: refreshContributions, saveContribution(referenceDate,amount), deleteContribution. Transações: createTransaction/updateTransaction/deleteTransaction (recarregam mês + histórico). Categorias: createCategory/updateCategory/deleteCategory.

12. Frontend — App shell, router e views
router/index.ts (createWebHistory)
name	path	meta
login	/login	public:true
setup-2fa	/setup-2fa	bare:true
dashboard	/	—
expenses	/expenses	—
goals	/goals	—
config	/config	—
settings	/settings	—
(catch-all)	/:pathMatch(.*)*	redirect → /
Views são lazy (() => import(...)). beforeEach: rota não-public sem auth → login; login autenticado → dashboard; MFA obrigatório: se auth.user?.totpEnabled === false e rota ≠ setup-2fa → setup-2fa; se já configurado e rota = setup-2fa → dashboard.

App.vue (shell)
showChrome = !meta.public && !meta.bare && isAuthenticated. Sidebar com estado pinned persistido (localStorage 'fp_sidebar_expanded') + hover (empurra o conteúdo, sem overlay): effectiveExpanded = expanded || sidebarHovered. onMounted faz refreshUser + ensureData (finance.init() se autenticado e totpEnabled !== false).

Wrapper com chrome: relative h-full w-full bg-gradient-to-b from-sky-100 via-white to-pink-100, contém <AppSidebar> e <main>.
<main>: flex h-full flex-col overflow-hidden bg-slate-50 transition-[margin-left] duration-300 ease-out lg:relative lg:z-10 lg:rounded-l-[2rem] lg:shadow-[-10px_0_28px_-8px_rgba(15,23,42,0.09)], :class="effectiveExpanded ? 'lg:ml-64' : 'lg:ml-[4.5rem]'".
Header sticky (h-16, border-b border-ink-200 bg-slate-50/85 backdrop-blur): botão menu (mobile, abre drawer), <h2> título da página (mapa { expenses:'Gestão de Passivos', goals:'Metas e Conquistas', config:'Configurações', settings:'Segurança' }, default 'Painel'), à direita o navegador de mês (chevronLeft / monthLabel / chevronRight chamando finance.prevMonth/nextMonth) e um chip de renda formatCurrency(finance.income) (md:inline-flex, bg-sky-50 text-sky-700 font-mono).
Conteúdo: <div class="mx-auto w-full max-w-[88rem] p-4 sm:p-6 lg:p-8"> + <RouterView> com <Transition name="page" mode="out-in"> (key route.fullPath). <ToastContainer/> sempre montado.
Transição page: enter/leave opacity .28s + transform .32s cubic-bezier(0.34,1.4,0.64,1) + filter blur; from translateY(6px) blur(4px), leave-to translateY(-4px) blur(3px).
DashboardView (/)
isLoading = loading || !initialized. Estado loading = vários <Skeleton> no formato do layout. Layout carregado (space-y-6), em ordem:

4 StatCards (grid sm:grid-cols-2 xl:grid-cols-4, v-reveal stagger 0/70/140/210): (a) "Custos Fixos" value fixedPlanned, hint ${formatCurrency(fixedSpent)} gasto, accent pink, delta fixedSpentDelta inverse-delta, spark sparkFixed; (b) "Transações do mês" value transactionsTotal, hint ${n} lançamento(s), accent sky, delta transactionsDelta inverse, spark sparkTx; (c) "Saldo Atual" value available, hint "Renda menos gastos do mês", accent neutral, delta totalSpentDelta inverse, spark sparkAvailable; (d) "Taxa de poupança" value savingsRate format percent, hint "(Renda − Gastos) / Renda", accent emerald, delta savingsRateDelta delta-as-pp, spark sparkSavings.
Projeção + Insights + Top-5 (grid lg:grid-cols-3, com var CSS --proj-h medida via ResizeObserver no card de projeção p/ igualar alturas): <ProjectionCard :projection :income :total-spent>, <InsightsCard :insights>, <TopTransactionsCard :items="topTransactions">.
Distribuição por categoria + Histórico (grid lg:grid-cols-2): card esquerdo com header section-tag "Gastos por categoria" + <Segmented v-model="donutMode" :options=[{transactions,'Transações'},{all,'Geral'}]> + <CategoryDonut :summary="donutSummary" :details="donutDetails" @select>; clique numa fatia abre drilldown <CategoryTrendChart>. Card direito header "Histórico — últimos 12 meses" + <Segmented v-model="barMode"> + <MonthlyBarChart :history :mode>.
donutMode/barMode ref<'transactions'|'all'>. donutSummary: em modo 'all' com fixedSpent>0, adiciona fatia sintética {id:'_fixed_', name:'Passivos Fixos', color:'#ec4899', total:fixedSpent}. donutDetails: por categoria, lista {label: t.description||'(sem descrição)', amount} desc.
Renda × Gastos + Saldo líquido (grid lg:grid-cols-2): <IncomeVsExpenseChart :history> (header emerald "Renda × Gastos (12 meses)") e <NetBalanceChart :history> ("Saldo líquido (12 meses)").
Heatmap diário full-width: <CalendarHeatmap :month="currentMonth" :daily="dailyMap">.
ExpensesView (/expenses)
3 blocos:

Auditoria de fontes de renda (card, header gradiente emerald→sky com badge wallet, kicker "Receita do mês", título "Auditoria de fontes", total formatCurrency(income) + "N fonte(s)"). Lista editável inline de incomeSources (cada item: badge wallet, descrição clicável p/ editar, valor text-emerald-700, botões editar/remover hover). Form "Nova fonte" (dashed emerald): input descrição (placeholder Ex.: Salário João, Freelance, 13º...), input valor (inputmode=decimal, reformata no blur), botão gradiente .income-add "Adicionar". Toasts: "Fonte adicionada/atualizada/removida"; validações pt-BR.
Grid 2 colunas (lg:grid-cols-2): Passivos Fixos (header pink, ícone home, botão "Inserir" abre ExpenseModal type=fixed; body scroll max-h:480px de <ExpenseRow> com @update-spent/@edit/@delete; footer "Total" fixedPlanned) e Transações do mês (header sky, ícone cart, botão "Registrar" abre TransactionModal; <TransactionRow>; footer "Total" transactionsTotal). defaultTxDate = hoje se mês visível == mês real, senão currentMonth.
Modais: ExpenseModal, TransactionModal, ConfirmModal (delete genérico com pending:{kind,id}). .income-add: gradiente linear-gradient(135deg,#10b981 0%,#0ea5e9 140%), texto branco, shadow esverdeada, hover #059669→#0284c7.
GoalsView (/goals)
Grid 2 colunas:
Card meta longo prazo (goal-card): hero com gradiente linear-gradient(135deg,#0ea5e9 0%,#38bdf8 35%,#ec4899 100%), círculos decorativos, badge avião (Icon plane), kicker "Projeto", título "Mudança EUA", pill ${longTermPct.toFixed(1)}%, valor formatCurrency(saved) "de formatCurrency(target)" (+ "· até formatMonthLabel(targetDate)"), barra branca de progresso, rodapé "N aporte(s)" / "formatCurrency(restante) restante". Abaixo, <Segmented v-model="goalTab" :options=[{values,'Valores'},{date,'Data alvo'},{contributions,'Aportes'}]>: aba values (inputs "Valor alocado (R$)"/"Meta (R$)" com commit no blur → updateLongTerm); aba date (<DatePicker :min=todayIso> → updateLongTerm({targetDate}), helper "Faltam N meses até o alvo."); aba contributions (form Mês <DatePicker> + valor + botão Salvar → saveContribution; histórico sortedContributions desc com badge mês/ano, total pill emerald, clique edita, hover remove).
Card conquistas (achievements-card): header gradiente sky→pink, badge target, título "Nossas conquistas", contador completed/total ou "Marcos para a jornada...", botão "Nova" abre GoalModal. Barra de progresso gradiente sky→pink (achievementsPct). <transition-group name="ach-list"> de sortedAchievements (pendentes primeiro): cada item com .ach-toggle redondo (marca concluída via toggleAchievement), título (riscado quando done), badge "✓", .ach-trash hover (askDelete). Empty state com badge target + "Sem conquistas ainda" + CTA "Adicionar primeira".
Burndown full-width: <GoalBurndownChart :contributions :saved :target :target-date>.
Simulação full-width: <GoalSimulationCard :saved :target :target-date>.
Modais: GoalModal, ConfirmModal title="Remover conquista?". Estilos :deep casuais para .input/DatePicker (borda transparente, focus pink), .btn-primary gradiente sky→pink.
LoginView (/login, full-screen)
Split-screen com carrossel de imagens (slides = ['/login/main.jpeg','/login/slide-2.jpeg','/login/slide-3.jpeg','/login/slide-4.jpeg'], autoplay 6000ms, pausa no hover do painel desktop, dots + setas prev/next). Painel do formulário: <h1 class="display">Bem-vindo de volta!</h1>, inputs .login-input (usuário/senha), e — quando o backend responde TOTP_REQUIRED — campo de código 6 dígitos (tracking-[0.5em], autofocus) + botão "Voltar". Botão .login-btn cor terracota #a8675f (hover #955650), label Entrando.../Verificar e entrar/Entrar. Trata erros por e.response.data.code (TOTP_REQUIRED→mostra campo; TOTP_INVALID→mensagem; senão a message). Rodapé com filetes "Finance Plan · Ana & João". Caption das imagens: "O nosso resumo financeiro. / O nosso futuro." + "Ana e João".
.login-input: rounded-xl border border-ink-200 px-5 py-3.5 focus:border-sky-500 focus:ring-2 focus:ring-sky-100. .login-btn: rounded-xl bg-[#a8675f] px-5 py-3.5 text-white shadow-soft hover:bg-[#955650].

ConfigView (/config)
Coluna estreita (max-w-2xl). Card "Categorias de gastos" (ícone list, botão "Nova" abre CategoryModal): lista de categorias (swatch de cor, nome, <code> hex, botões editar/remover hover). ConfirmModal com título dinâmico e mensagem "Não é possível remover se a categoria estiver em uso por alguma transação." Toasts pt-BR.

SettingsView (/settings)
Coluna estreita. Card "Alterar senha" (kicker "Conta · Credenciais", ícone lock): form senha atual + nova + confirmar (valida ≥6 e match), changePassword, toast "Senha alterada com sucesso!". Card 2FA (ícone shield, pill Ativo/Inativo): se ativo, input senha + btn-danger "Desativar 2FA"; se em setupMode, passos numerados + <img :src="qrDataUrl"> + secret select-all + input código + "Confirmar e ativar"; senão botão "Ativar 2FA" (startSetup). onMounted → auth.refreshUser().

SetupTwoFactorView (/setup-2fa, bare/full-screen)
Gate de enrollment 2FA obrigatório. onMounted chama auth.setupTotp() (QR + secret). Card com passos, QR, secret, input código 6 dígitos (Enter confirma), botão "Ativar e continuar" (enableTotp → push dashboard), e link "Sair" (logout → login). Backdrop gradiente from-sky-50 via-slate-50 to-pink-50.

13. Frontend — componentes (31)
Todos usam <script setup lang="ts"> (exceto Skeleton sem script). Gráficos via Chart.js v4 + vue-chartjs (Doughnut/Bar/Line), exceto Sparkline e CalendarHeatmap (SVG/CSS na mão); ProgressBar, ProjectionCard, InsightsCard, TopTransactionsCard não são gráficos.

Primitivos do design system
Icon.vue: props name:string, size?=20. Mapa name→glyph Material Symbols Rounded: wallet→account_balance_wallet, dashboard→dashboard, list→list_alt, home→home, cart→shopping_cart, plane→flight, target→track_changes, barChart→bar_chart, plus→add, trash→delete, x→close, edit→edit, menu→menu, menuOpen→menu_open, logout→logout, chevronLeft→chevron_left, chevronRight→chevron_right, chevronDown→expand_more, chevronUp→expand_less, check→check, trending→trending_up, shield→shield, lock→lock, tune→tune, settings→settings. Render <span class="material-symbols-rounded select-none align-middle leading-none" :style="{fontSize}">{{glyph}}</span>.
StatCard.vue: props label, value:number, hint?, accent?:'sky'|'pink'|'neutral'|'emerald'(='neutral'), delta?:number|null, deltaAsPp?, inverseDelta?, spark?:number[], format?:'currency'|'percent'(='currency'). Render relative overflow-hidden rounded-2xl p-6 text-white shadow-card + cor de fundo por accent (sky-500/pink-500/emerald-500/ink-700) + 2 círculos bg-white/10. value font-mono text-3xl/4xl font-extrabold. Pill de delta: ↑/↓ N% ou ±N.N pp; verde se variação "boa" (respeitando inverseDelta), rosa se ruim, neutro se ~0. Se spark.length>1, embute <Sparkline>.
ProgressBar.vue: props value(0-100), color?:'sky'|'pink'. Track h-3 border border-line-strong bg-paper-warm, fill h-full transition-all duration-700 (bg-sky-600/bg-pink-500).
Segmented.vue: props modelValue, options:{value,label}[]; emit update:modelValue. Container inline-flex rounded-lg border border-ink-200 bg-white p-0.5 shadow-soft; ativo bg-sky-600 text-white, inativo text-ink-500 hover:bg-slate-50.
Select.vue: dropdown custom. SelectOption{value,label,color?}. props modelValue, options, placeholder?, disabled?; emit update:modelValue. Trigger .input + chevron rotativo; lista <Transition> absoluta shadow-pop, item selecionado bg-sky-50 text-sky-700 + check; fecha em clique fora/Escape.
BaseModal.vue: props open, title; emit close; slots default + footer. <Teleport to="body"> + <Transition name="modal"> (fade 0.18s). Overlay fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm (@click.self=close). Painel w-full max-w-md rounded-2xl border border-ink-200 bg-white shadow-pop com header (título + botão x) e footer condicional.
AppSidebar.vue: props expanded, mobileOpen; emits toggle, close-mobile, hover-change. Nav: [{'/','Painel','dashboard'},{'/expenses','Despesas','list'},{'/goals','Metas','target'},{'/config','Configurações','tune'},{'/settings','Segurança','shield'}]. Aside fixed inset-y-0 left-0 ... bg-gradient-to-b from-sky-100 via-white to-pink-100 transition-[transform,width] duration-300; largura lg:w-64 (expandido) / lg:w-[4.5rem] (colapsado); hover expande sem mudar a preferência (emite hover-change). Brand (logo wallet sky-600, "Finance Plan" / "Ana & João"). Itens ativos bg-white/70 text-sky-700 shadow-soft; quando colapsado label some e usa :title. Rodapé: avatar (1ª letra do nome, bg-pink-200/80 text-pink-700), nome/@username, logout.
Gráficos
Sparkline.vue (SVG na mão): props data:number[], color?='rgba(255,255,255,0.85)', height?=32. viewBox 0 0 100 36 preserveAspectRatio=none. Path normaliza valores na faixa com 2px de padding; área fechada até a base com gradiente vertical (id aleatório, opacidade 0.35→0); linha stroke-width 1.5 round.
CalendarHeatmap.vue (CSS grid): props month:'YYYY-MM-01', daily:Record<string,number>. Header section-tag "Gastos por dia" (ícone dashboard pink) + legenda "menos … mais" (5 swatches ink-100, pink-200/300/400/500). Grid 7 colunas, header ['D','S','T','Q','Q','S','S'], células aspect-square rounded-md coloridas por intensidade (value/max: >0.8 pink-500 … ≤0 ink-100), hoje com ring-2 ring-sky-500 ring-offset-1, :title="${date} — ${formatCurrency(value)}".
DonutChart.vue (Doughnut): props fixed, variable, available. labels ['Fixos','Variáveis','Sobra'], cores ['#ec4899','#0078db','#e3deca'], borderColor '#fbfaf5', cutout '64%', legenda inferior. (Componente utilitário; o dashboard usa CategoryDonut.)
CategoryDonut.vue (Doughnut interativo): props summary:CategorySummary[], details?:Record<string,{label,amount}[]>; emit select(cat). Cores por s.color || '#94a3b8', cutout '62%', onClick emite categoria, onHover cursor pointer. Tooltip escuro rico listando os details. Empty: "Sem transações neste mês ainda."
MonthlyBarChart.vue (Bar): props history, mode?='transactions'. Labels Mmm/YY. Em 'all' = 2 datasets empilhados ("Transações" #0ea5e9, "Passivos Fixos" #ec4899); senão 1 dataset. borderRadius 6, maxBarThickness 28. Tooltip expande breakdowns.
NetBalanceChart.vue (Bar): props history. net = income - fixed - transactions; barra verde (#10b981) se ≥0 senão rosa (#f43f5e). y permite negativos.
IncomeVsExpenseChart.vue (Bar agrupado): props history. 2 datasets: "Renda" #10b981, "Gasto total" (fixed+transactions) #ec4899. Tooltip mostra "Líquido".
CategoryTrendChart.vue (Line): props history, categoryName, color?. Série = total daquela categoria por mês. Linha suave tension 0.35, área color+'22', h-[220px].
GoalBurndownChart.vue (Line, complexo): props contributions, saved, target, targetDate?. Calcula avgPace (média dos 3 últimos aportes), idealPace = remaining/monthsUntilTarget, onTrack, statusText pt-BR. 4 datasets: "Acumulado real" (sky filled), "Projeção (ritmo atual)" (pink tracejado), "Ritmo ideal" (emerald tracejado), "Meta" (linha plana cinza). Header com pills Alvo/Ritmo médio/Ideal + grid 3 stats (Faltam / Até o alvo|ETA / Aportes) + status no rodapé.
GoalSimulationCard.vue (Line + form, mais complexo): props saved, target, targetDate. Simulação local (não persiste): inputs "Já temos (R$)" (com link "usar atual"), "Aporte mensal (R$)", <DatePicker> data final. Calcula projectedTotal, diffVsTarget, monthlyToHitOnTime. Plano em 2 fases quando a projeção fica aquém: Fase 1 (seu aporte) + Fase 2 (necessário, maior). 3 datasets (Fase 1 sky / Fase 2 pink tracejado / Meta). Stats grid (Meses/Projetado/vs Meta colorido/Meses p/ meta) + botão de sugestão "Usar R$ x/mês".
ProjectionCard.vue (NÃO gráfico): props projection:number|null, income, totalSpent. section-tag "Projeção do mês", valor grande, mensagem-veredito pt-BR; barra totalSpent/income colorida (emerald/amber/pink conforme pace).
InsightsCard.vue (NÃO gráfico): props insights:{kind,text}[]. section-tag "Insights do mês" (ícone tune pink); lista com anel por kind (good emerald/warn amber/info sky) + ícone em chip branco. Empty state centralizado.
TopTransactionsCard.vue (NÃO gráfico): props items:Transaction[]. section-tag "Top 5 gastos do mês"; lista com rank 01.., dot de cor da categoria, descrição/categoria + dd/mm, valor font-mono.
Modais (envolvem BaseModal — open, loading?, emit close, save; reset no watch de open; Enter submete via botão escondido)
ConfirmModal: props open, title?='Excluir item?', message?='Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.', loading?; emit close, confirm. Footer ghost "Cancelar" + .btn-danger "Excluir"/"Excluindo...".
TransactionModal: props open, transaction:Transaction|null, categories:Category[], defaultDate:string, loading?; emit save({amount,categoryId,occurredAt,description}). Campos: "Valor (R$)" (autofocus), "Data" <DatePicker>, "Categoria" <Select>, "Descrição".
ExpenseModal: props open, type:ExpenseType, expense:ComputedExpense|null, loading?; emit save({title,description,amount}). Campos: "Identificação", "Detalhes (opcional)", "Orçamento planejado (R$)".
GoalModal: props open, loading?; emit save(title). Campo único "Nome da conquista".
CategoryModal: props open, category:Category|null, loading?; emit save({name,color}). PALETTE = ['#0ea5e9','#ec4899','#10b981','#f97316','#ef4444','#f59e0b','#8b5cf6','#14b8a6','#84cc16','#a855f7','#06b6d4','#64748b']. Campos "Nome" + grade de swatches redondos + <input type="color"> "Custom".
Linhas e utilitários
DatePicker.vue (calendário custom, único com CSS escopado extenso): props modelValue:string|null, min?, max?, placeholder?='dd/mm/aaaa', disabled?, allowClear?=true; emits update:modelValue, change. 3 views (dias/meses/anos), nomes PT-BR, semana começa domingo (['D','S','T','Q','Q','S','S']). Trigger .input com ícone calendário via background-image SVG (sky #0ea5e9, hover pink #ec4899). Popover .dp__pop (18rem, radius 16, <Transition dp-pop>), célula selecionada sky.500, hoje com anel sky-400, rodapé "Hoje" + "Limpar". Fecha em clique fora/Escape.
TransactionRow.vue: props transaction; emits edit, delete. Row group ... rounded-xl border border-ink-200 hover:border-ink-300: chip de data dd/mm, badge de categoria (cor com alfa 10%/20%), descrição truncada, valor font-mono, botões editar(sky)/trash(pink) hover.
ExpenseRow.vue: props expense:ComputedExpense; emits update-spent(id,value), edit, delete. Título + descrição, "Plan." (planejado), input "gasto" inline (prefixo R$, commit no blur), "Disp." (available) colorido por adjusted (pink<0 / amber parcial / sky ok).
ToastContainer.vue: lê store toast. <Teleport> stack fixed bottom-4 right-4 z-[60] w-80, <TransitionGroup name="toast"> (entra de baixo, sai pela direita); cores success sky / error pink / info neutro; ícone check/x.
Skeleton.vue (sem script): <div class="animate-pulse rounded-xl border border-ink-200 bg-slate-100" />.
Spinner.vue: prop size?=16. <span class="inline-block animate-spin rounded-full border-2 border-current border-t-transparent">.
Tema compartilhado dos gráficos: tooltip escuro rgba(15,23,42,0.95), texto branco, cornerRadius 10, padding 12, displayColors:false, título Poppins 13/700, corpo 12/500. Eixos: x grid oculto, ticks #64748b Poppins 11; y grid #e5e7eb, ticks R$ <pt-BR>. Bar/Line em wrapper relative h-[280px] (ou h-[220px] nos dois menores), maintainAspectRatio:false.

14. Deploy (Vercel — 1 projeto)
vercel.json:


{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "npm install",
  "buildCommand": "npm run prisma:generate && npm run build:api && npm run build:web",
  "outputDirectory": "apps/web/dist",
  "functions": { "api/index.ts": { "includeFiles": "apps/api/dist/**" } },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
Env vars na Vercel: DATABASE_URL, DIRECT_URL, JWT_SECRET, JWT_EXPIRES_IN. O binaryTargets inclui rhel-openssl-3.0.x e o build roda prisma generate.

Setup local: npm install → configurar apps/api/.env (Postgres) → npm run prisma:migrate (ou prisma db push) → npm run prisma:generate → npm run prisma:seed → npm run dev (API :3000, Web :5173 com proxy /api).

15. Personalização (trocar para a outra pessoa)
Mantenha toda a arquitetura idêntica; substitua só estes valores:

Usuários do seed (prisma/seed.ts): ana/Ana e joao/João → os dois novos nomes/usernames.
Branding do casal: textos "Ana & João" / "Ana e João" (em index.html <title>, AppSidebar, LoginView caption e rodapé).
Título da meta de longo prazo: constante LONG_TERM_TITLE = 'Mudança EUA' em stores/finance.ts (e o badge avião/"Projeto" no hero da GoalsView, se quiser outro tema).
Imagens do login: apps/web/public/login/{main,slide-2,slide-3,slide-4}.jpeg (substituir pelas novas fotos; manter os nomes ou ajustar o array slides em LoginView).
Frases do carrossel em LoginView: "O nosso resumo financeiro. / O nosso futuro."
Credenciais/segredos: SEED_PASSWORD, JWT_SECRET, e a DATABASE_URL/DIRECT_URL do novo Postgres (Supabase, Neon, Railway, etc.).
Categorias padrão do seed (opcional): a lista de 8 categorias com cores.
Paleta de cores (opcional): se quiser outra identidade, ajuste sky/pink no tailwind.config.js e a cor terracota #a8675f do botão de login.
Tudo o mais (rotas, schema, validações, gráficos, lógica de orçamento/projeção/insights, 2FA obrigatório) deve ser reproduzido fielmente.

Algumas observações rápidas pra você:

As imagens do login (apps/web/public/login/*.jpeg) não cabem num texto — o outro chat vai precisar que você forneça fotos novas ou ele usa placeholders.
2FA é obrigatório: no primeiro login o app força a configuração do TOTP. Vale avisar a outra pessoa pra ter um app autenticador (Google Authenticator etc.) à mão.
Deixei a seção 15. Personalização marcando exatamente o que trocar (nomes, meta "Mudança EUA", seed, segredos). Se quiser, posso gerar uma versão já genérica/parametrizada (sem "Ana & João" nem "Mudança EUA") pra ela só preencher os nomes — é só pedir.