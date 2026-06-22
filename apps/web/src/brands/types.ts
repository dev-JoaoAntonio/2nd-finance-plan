/**
 * Configuração de "marca" (white-label).
 *
 * Cada pessoa tem um arquivo de marca (ex.: original.ts, valdeci.ts) que
 * preenche este contrato. A marca ativa é escolhida em build-time pela
 * variável VITE_BRAND ou pelo `--mode` do Vite (ver index.ts) e aplicada em
 * runtime por apply.ts (cores do Quasar + variáveis CSS + título/ícone).
 *
 * Tudo que muda de uma pessoa para outra deve viver aqui — nada de cores,
 * textos ou nomes "chumbados" pelos componentes.
 */

/** Cores semânticas do Quasar (aplicadas via setCssVar). */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  positive: string;
  negative: string;
  info: string;
  warning: string;
}

/** Cores de superfície/tema (aplicadas como variáveis CSS --fp-*). */
export interface BrandSurfaces {
  text: string; // texto principal (quase-preto, alto contraste)
  textMuted: string; // texto secundário (.fp-muted)
  pageBg: string; // fundo da página (body)
  cardBg: string; // fundo dos cartões (.fp-card)
  cardBorder: string; // borda dos cartões
  navActiveBg: string; // item de navegação ativo (fundo)
  navActiveFg: string; // item de navegação ativo (texto/ícone)
  focusRing: string; // contorno de foco (acessibilidade de teclado)
  authGradFrom: string; // gradiente da tela de login (início)
  authGradTo: string; // gradiente da tela de login (fim)
  positiveText: string; // realce positivo em texto (.fp-positive)
  negativeText: string; // realce negativo em texto (.fp-negative)
}

/** Acessibilidade: fonte e escala de letra. */
export interface BrandAccessibility {
  fontFamily: string; // família CSS (todas as marcas usam Atkinson por padrão)
  fontLevels: number[]; // tamanhos de base em px (botões A− / A+)
  defaultLevelIndex: number; // índice inicial em fontLevels
  showFontControl: boolean; // mostra o controle de tamanho de letra no topo
}

/** Textos da marca (copy). */
export interface BrandCopy {
  authTagline: string; // subtítulo da tela de login
  loginTitle: string;
  registerTitle: string;
  dashboardSubtitle: string;
}

export type DashboardWidget = 'summary' | 'categoryDonut' | 'trend' | 'recent';

/** Configuração do dashboard (quais blocos aparecem e em qual ordem lógica). */
export interface BrandDashboard {
  widgets: DashboardWidget[];
  trendMonths: number; // quantos meses no gráfico de evolução
}

export interface BrandConfig {
  /** Identificador estável — enviado ao backend no cadastro (seed por marca). */
  id: string;
  appName: string; // nome completo (tela de login)
  shortName: string; // nome curto (cabeçalho do app)
  logoIcon: string; // ícone de marca (Material Symbols)
  colors: BrandColors;
  surfaces: BrandSurfaces;
  accessibility: BrandAccessibility;
  copy: BrandCopy;
  dashboard: BrandDashboard;
}
