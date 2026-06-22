/** @type {import('tailwindcss').Config} */

// ── PALETA (personalização Valdeci) ──────────────────────────────────────────
// O design original era "duotone" rosa + azul. Aqui remapeamos as DUAS chaves
// de cor para manter o resto do spec idêntico, sem reescrever classes:
//   - `sky`  → VERDE MUSGO  (cor primária da marca)
//   - `pink` → BEGE/ARDÓSIA / CLAY (segunda cor, neutro quente)
// Perigo/negativo usa `rose`/`red` (padrão do Tailwind) onde for semântico.
// Os neutros "papel" (paper/line/ink) já casam com o tema e foram mantidos.
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: {
          DEFAULT: '#fbfaf5',
          cream: '#f5f1e7',
          cool: '#f1f5fa',
          warm: '#faf6ec',
        },
        line: { DEFAULT: '#e3deca', strong: '#c9c2a4' },
        night: '#0a0e1a',
        ink: {
          DEFAULT: '#0a1020',
          2: '#475569',
          3: '#94a3b8',
          4: '#cbd5e1',
          50: '#f7f6f1',
          100: '#eeece4',
          200: '#e5e7eb',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0a1020',
        },
        // sky → VERDE MUSGO (primária)
        sky: {
          50: '#eef4ef',
          100: '#d9e7dc',
          200: '#b9d0bf',
          300: '#8fb39a',
          400: '#5f9070',
          500: '#467a58',
          600: '#3e6b4f',
          700: '#2f5740',
          800: '#264634',
          900: '#1d3528',
          950: '#0f1f17',
        },
        // pink → BEGE/ARDÓSIA / CLAY (segunda cor, neutro quente)
        pink: {
          50: '#f6f1ec',
          100: '#ece0d4',
          200: '#ddc8b4',
          300: '#c9a883',
          400: '#b08a5f',
          500: '#9c7350',
          600: '#855f3f',
          700: '#6d4d33',
          800: '#583e2a',
          900: '#473322',
          950: '#2b1e14',
        },
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15,23,42,.04), 0 1px 3px -1px rgba(15,23,42,.06)',
        card: '0 1px 3px 0 rgba(15,23,42,.06), 0 10px 25px -16px rgba(15,23,42,.25)',
        pop: '0 20px 50px -22px rgba(15,23,42,.35)',
      },
      borderRadius: {
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.625rem',
      },
      letterSpacing: { tightest: '-0.06em' },
    },
  },
  plugins: [],
};
