import type { BrandConfig } from './types';

/**
 * Marca do Valdeci — também usuário idoso, então mantém o mesmo padrão de
 * acessibilidade da marca original (letra grande ajustável, alto contraste,
 * alvos grandes, mesmas categorias, mesmo dashboard). Muda só a identidade
 * visual: paleta VERDE MUSGO DESBOTADA (sage/moss), calma e de baixo brilho.
 *
 * Contraste verificado: texto branco sobre `primary` (#3E6B4F) ≈ 6:1 (passa
 * AA para texto normal). Textos escuros sobre fundos claros mantêm ≥ 7:1.
 */
export const valdeciBrand: BrandConfig = {
  id: 'valdeci',
  appName: 'Planejador do Valdeci',
  shortName: 'Planejador',
  logoIcon: 'savings',
  colors: {
    primary: '#3E6B4F', // verde musgo profundo — ações principais (branco em cima ≈ 6:1)
    secondary: '#51664E', // verde-acinzentado — ações secundárias
    accent: '#7B8B45', // oliva desbotado — destaques pontuais
    positive: '#2F7D55', // verde claro de sucesso (distinto do primary)
    negative: '#C0392B', // vermelho-tijolo (alertas / exclusão)
    info: '#3E6B4F',
    warning: '#B9831C', // âmbar desbotado
  },
  surfaces: {
    text: '#1B2A1F', // quase-preto com leve tom verde (~15:1 no claro)
    textMuted: '#4A5A4C',
    pageBg: '#EEF2EA', // off-white levemente esverdeado (desbotado)
    cardBg: '#FFFFFF',
    cardBorder: '#D8E2D4',
    navActiveBg: '#DCE8D6',
    navActiveFg: '#2F5740',
    focusRing: '#3E6B4F',
    authGradFrom: '#DCE8D2',
    authGradTo: '#EEF2EA',
    positiveText: '#2F6B47',
    negativeText: '#A93226',
  },
  accessibility: {
    fontFamily: "'Atkinson Hyperlegible', 'Segoe UI', Roboto, sans-serif",
    fontLevels: [16, 18, 20, 22, 24],
    defaultLevelIndex: 1,
    showFontControl: true,
  },
  copy: {
    authTagline: 'Acompanhe seus gastos com tranquilidade.',
    loginTitle: 'Entrar na minha conta',
    registerTitle: 'Criar minha conta',
    dashboardSubtitle: 'Veja um resumo dos seus gastos.',
  },
  dashboard: {
    widgets: ['summary', 'categoryDonut', 'trend', 'recent'],
    trendMonths: 6,
  },
};
