<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFinanceStore } from '@/stores/finance';
import { formatCurrency, formatMonthLabel } from '@/utils/format';
import AppSidebar from '@/components/AppSidebar.vue';
import ToastContainer from '@/components/ToastContainer.vue';
import Icon from '@/components/Icon.vue';

const route = useRoute();
const auth = useAuthStore();
const finance = useFinanceStore();

const SIDEBAR_KEY = 'fp_sidebar_expanded';
const expanded = ref(localStorage.getItem(SIDEBAR_KEY) !== 'false');
const sidebarHovered = ref(false);
const mobileOpen = ref(false);
const effectiveExpanded = computed(() => expanded.value || sidebarHovered.value);

const showChrome = computed(
  () => route.meta.public !== true && auth.isAuthenticated,
);

const titles: Record<string, string> = {
  expenses: 'Gestão de Passivos',
  goals: 'Metas e Conquistas',
  config: 'Configurações',
  settings: 'Segurança',
};
const pageTitle = computed(() => titles[String(route.name ?? '')] ?? 'Painel');

function toggleSidebar() {
  expanded.value = !expanded.value;
  localStorage.setItem(SIDEBAR_KEY, String(expanded.value));
}

onMounted(async () => {
  if (!auth.isAuthenticated) return;
  await auth.refreshUser();
  if (auth.isAuthenticated) await finance.init();
});
</script>

<template>
  <div
    v-if="showChrome"
    class="relative h-full w-full bg-gradient-to-b from-sky-100 via-white to-pink-100"
  >
    <AppSidebar
      :expanded="effectiveExpanded"
      :mobile-open="mobileOpen"
      @toggle="toggleSidebar"
      @close-mobile="mobileOpen = false"
      @hover-change="(v: boolean) => (sidebarHovered = v)"
    />

    <main
      class="flex h-full flex-col overflow-hidden bg-slate-50 transition-[margin-left] duration-300 ease-out lg:relative lg:z-10 lg:rounded-l-[2rem] lg:shadow-[-10px_0_28px_-8px_rgba(15,23,42,0.09)]"
      :class="effectiveExpanded ? 'lg:ml-64' : 'lg:ml-[4.5rem]'"
    >
      <header
        class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ink-200 bg-slate-50/85 px-4 backdrop-blur sm:px-6"
      >
        <button
          class="grid h-10 w-10 place-content-center rounded-lg text-ink-600 hover:bg-slate-200 lg:hidden"
          aria-label="Abrir menu"
          @click="mobileOpen = true"
        >
          <Icon name="menu" :size="22" />
        </button>
        <h2 class="text-lg font-bold text-ink-900">{{ pageTitle }}</h2>

        <div class="ml-auto flex items-center gap-2">
          <div class="flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-0.5">
            <button
              class="grid h-8 w-8 place-content-center rounded-md text-ink-500 hover:bg-slate-100"
              aria-label="Mês anterior"
              @click="finance.prevMonth()"
            >
              <Icon name="chevronLeft" :size="18" />
            </button>
            <span class="min-w-[140px] text-center text-sm font-semibold text-ink-700">
              {{ formatMonthLabel(finance.currentMonth) }}
            </span>
            <button
              class="grid h-8 w-8 place-content-center rounded-md text-ink-500 hover:bg-slate-100"
              aria-label="Próximo mês"
              @click="finance.nextMonth()"
            >
              <Icon name="chevronRight" :size="18" />
            </button>
          </div>
          <span
            class="hidden items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 font-mono text-sm font-semibold text-sky-700 md:inline-flex"
          >
            <Icon name="wallet" :size="16" />
            {{ formatCurrency(finance.income) }}
          </span>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto w-full max-w-[88rem] p-4 sm:p-6 lg:p-8">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </RouterView>
        </div>
      </div>
    </main>

    <ToastContainer />
  </div>

  <template v-else>
    <RouterView />
    <ToastContainer />
  </template>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.32s cubic-bezier(0.34, 1.4, 0.64, 1),
    filter 0.28s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
  filter: blur(4px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  filter: blur(3px);
}
</style>
