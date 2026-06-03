import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { title: 'Início' },
      },
      {
        path: 'gastos',
        name: 'expenses',
        component: () => import('@/pages/ExpensesPage.vue'),
        meta: { title: 'Meus gastos' },
      },
      {
        path: 'categorias',
        name: 'categories',
        component: () => import('@/pages/CategoriesPage.vue'),
        meta: { title: 'Categorias' },
      },
      {
        path: 'conta',
        name: 'account',
        component: () => import('@/pages/AccountPage.vue'),
        meta: { title: 'Minha conta' },
      },
    ],
  },
  {
    path: '/entrar',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
      },
      {
        path: '/criar-conta',
        name: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    redirect: { name: 'dashboard' },
  },
];
