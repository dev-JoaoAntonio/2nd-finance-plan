import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  // Já autenticado tentando ir para login/registro → manda para o início.
  if (!requiresAuth && auth.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
