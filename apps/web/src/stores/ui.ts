import { defineStore } from 'pinia';
import { ref } from 'vue';
import { activeBrand } from '@/brands';

const SCALE_KEY = 'fp_font_scale';

// Níveis de tamanho de fonte (px da base) vêm da marca ativa (acessibilidade).
const LEVELS = activeBrand.accessibility.fontLevels;
const DEFAULT_INDEX = activeBrand.accessibility.defaultLevelIndex;

export const useUiStore = defineStore('ui', () => {
  const fontIndex = ref(readStoredIndex());

  function apply() {
    document.documentElement.style.setProperty(
      '--fp-font-base',
      `${LEVELS[fontIndex.value]}px`,
    );
    localStorage.setItem(SCALE_KEY, String(fontIndex.value));
  }

  function increase() {
    if (fontIndex.value < LEVELS.length - 1) {
      fontIndex.value++;
      apply();
    }
  }

  function decrease() {
    if (fontIndex.value > 0) {
      fontIndex.value--;
      apply();
    }
  }

  function init() {
    apply();
  }

  return { fontIndex, increase, decrease, init, apply, levels: LEVELS };
});

function readStoredIndex(): number {
  const raw = Number(localStorage.getItem(SCALE_KEY));
  return Number.isInteger(raw) && raw >= 0 && raw < LEVELS.length
    ? raw
    : DEFAULT_INDEX;
}
