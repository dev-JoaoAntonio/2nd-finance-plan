import axios from 'axios';

export const TOKEN_KEY = 'fp_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

// Injeta o token JWT (se houver) em toda requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Extrai uma mensagem de erro amigável da resposta da API. */
export function apiErrorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
    }
  }
  return fallback;
}
