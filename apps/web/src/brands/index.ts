import type { BrandConfig } from './types';
import { originalBrand } from './original';
import { valdeciBrand } from './valdeci';

export type { BrandConfig } from './types';

/** Marcas registradas (uma por pessoa). Para adicionar outra: crie o arquivo
 *  de marca e registre aqui com a mesma chave usada no build (--mode). */
const BRANDS: Record<string, BrandConfig> = {
  original: originalBrand,
  valdeci: valdeciBrand,
};

const DEFAULT_BRAND = 'original';

/**
 * Resolve a marca ativa.
 * Prioridade: VITE_BRAND (variável de ambiente, útil em plataformas de deploy)
 * → MODE do Vite (`vite build --mode valdeci`) → marca padrão.
 * Em dev (MODE = "development") ou build genérico, cai na marca original.
 */
function resolveBrandKey(): string {
  const fromEnv = import.meta.env.VITE_BRAND;
  if (fromEnv && BRANDS[fromEnv]) return fromEnv;
  const fromMode = import.meta.env.MODE;
  if (fromMode && BRANDS[fromMode]) return fromMode;
  return DEFAULT_BRAND;
}

export const activeBrand: BrandConfig = BRANDS[resolveBrandKey()];
