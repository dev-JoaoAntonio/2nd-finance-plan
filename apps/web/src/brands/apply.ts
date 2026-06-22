import { setCssVar } from 'quasar';
import type { BrandConfig } from './types';

/**
 * Aplica a marca em runtime, antes de montar o app:
 *  - cores semânticas do Quasar (--q-primary, --q-secondary, ...) via setCssVar;
 *  - cores de superfície/tema como variáveis CSS (--fp-*), lidas pelo app.scss
 *    e pelos estilos dos layouts;
 *  - família de fonte, título do documento e cor do tema (meta theme-color).
 */
export function applyBrand(brand: BrandConfig): void {
  const c = brand.colors;
  setCssVar('primary', c.primary);
  setCssVar('secondary', c.secondary);
  setCssVar('accent', c.accent);
  setCssVar('positive', c.positive);
  setCssVar('negative', c.negative);
  setCssVar('info', c.info);
  setCssVar('warning', c.warning);

  const s = brand.surfaces;
  const root = document.documentElement;
  const vars: Record<string, string> = {
    '--fp-text': s.text,
    '--fp-text-muted': s.textMuted,
    '--fp-page-bg': s.pageBg,
    '--fp-card-bg': s.cardBg,
    '--fp-card-border': s.cardBorder,
    '--fp-nav-active-bg': s.navActiveBg,
    '--fp-nav-active-fg': s.navActiveFg,
    '--fp-focus-ring': s.focusRing,
    '--fp-auth-grad-from': s.authGradFrom,
    '--fp-auth-grad-to': s.authGradTo,
    '--fp-positive-text': s.positiveText,
    '--fp-negative-text': s.negativeText,
    '--fp-font-family': brand.accessibility.fontFamily,
  };
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  document.title = brand.appName;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', c.primary);
}
