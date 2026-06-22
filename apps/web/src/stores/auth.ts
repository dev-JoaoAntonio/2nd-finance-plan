import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { authService } from '@/services/auth';
import { getToken, setToken } from '@/services/api';
import type { AuthUser } from '@/types';

const USER_KEY = 'fp_user';

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(readUser());
  const token = ref<string | null>(getToken());

  const isAuthenticated = computed(() => !!token.value);

  function persistUser(u: AuthUser | null) {
    user.value = u;
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }

  async function login(username: string, password: string) {
    const res = await authService.login(username, password);
    token.value = res.access_token;
    setToken(res.access_token);
    persistUser(res.user);
    return res;
  }

  function logout() {
    token.value = null;
    setToken(null);
    persistUser(null);
  }

  async function refreshUser() {
    if (!token.value) return;
    try {
      const me = await authService.me();
      persistUser(me);
    } catch {
      /* interceptor de 401 cuida do logout/redirect */
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    return authService.changePassword(currentPassword, newPassword);
  }

  return {
    user,
    token,
    isAuthenticated,
    persistUser,
    login,
    logout,
    refreshUser,
    changePassword,
  };
});
