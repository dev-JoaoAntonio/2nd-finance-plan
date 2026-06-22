import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api, TOKEN_KEY } from '@/lib/api';
import { activeBrand } from '@/brands';
import type { User } from '@/lib/types';

const USER_KEY = 'fp_user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const user = ref<User | null>(readStoredUser());

  const isAuthenticated = computed(() => !!token.value);

  function setSession(newToken: string, newUser: User) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data.token, data.user);
  }

  async function register(name: string, email: string, password: string) {
    // `brand` informa ao backend qual conjunto de categorias padrão semear.
    const { data } = await api.post('/auth/register', {
      name,
      email,
      password,
      brand: activeBrand.id,
    });
    setSession(data.token, data.user);
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return { token, user, isAuthenticated, login, register, logout, setSession };
});

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
