import type { BrandConfig } from './types';

/**
 * Marca original — usuária idosa. Tema CLARO de alto contraste, azul confiável
 * (paleta "Government/Public Service"). Mantém exatamente o visual e os textos
 * que o app tinha antes da refatoração de marcas.
 */
export const originalBrand: BrandConfig = {
  id: 'original',
  appName: 'Meu Planejador Financeiro',
  shortName: 'Meu Planejador',
  logoIcon: 'savings',
  colors: {
    primary: '#0369A1', // azul confiável (branco em cima: ~4.8:1)
    secondary: '#475569', // cinza-ardósia
    accent: '#7C3AED', // roxo — destaques pontuais
    positive: '#059669',
    negative: '#DC2626',
    info: '#0369A1',
    warning: '#D97706',
  },
  surfaces: {
    text: '#0F172A',
    textMuted: '#475569',
    pageBg: '#F1F5F9',
    cardBg: '#FFFFFF',
    cardBorder: '#E2E8F0',
    navActiveBg: '#E0F2FE',
    navActiveFg: '#0369A1',
    focusRing: '#0369A1',
    authGradFrom: '#E0F2FE',
    authGradTo: '#F1F5F9',
    positiveText: '#047857',
    negativeText: '#B91C1C',
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
