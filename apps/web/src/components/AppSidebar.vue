<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Icon from './Icon.vue';

const props = defineProps<{ expanded: boolean; mobileOpen: boolean }>();
const emit = defineEmits<{
  toggle: [];
  'close-mobile': [];
  'hover-change': [boolean];
}>();

const router = useRouter();
const auth = useAuthStore();

const nav = [
  { to: '/', label: 'Painel', icon: 'dashboard' },
  { to: '/expenses', label: 'Despesas', icon: 'list' },
  { to: '/goals', label: 'Metas', icon: 'target' },
  { to: '/config', label: 'Configurações', icon: 'tune' },
  { to: '/settings', label: 'Segurança', icon: 'shield' },
];

const displayName = computed(() => auth.user?.name || 'Valdeci');
const username = computed(() => auth.user?.username || 'valdeci');
const initial = computed(() => displayName.value.charAt(0).toUpperCase());

function logout() {
  auth.logout();
  router.replace({ name: 'login' });
}
</script>

<template>
  <!-- backdrop mobile -->
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
    @click="emit('close-mobile')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-sky-100 via-white to-pink-100 transition-[transform,width] duration-300 ease-out"
    :class="[
      expanded ? 'w-64' : 'lg:w-[4.5rem] w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    @mouseenter="emit('hover-change', true)"
    @mouseleave="emit('hover-change', false)"
  >
    <!-- brand -->
    <div class="flex h-16 items-center gap-3 px-4">
      <div class="grid h-9 w-9 shrink-0 place-content-center rounded-xl bg-sky-600 text-white">
        <Icon name="wallet" :size="20" />
      </div>
      <div v-show="expanded" class="overflow-hidden">
        <div class="truncate text-sm font-extrabold text-ink-900">Finance Plan</div>
        <div class="truncate text-[11px] font-semibold text-ink-500">
          {{ displayName }}
        </div>
      </div>
      <button
        class="ml-auto hidden h-8 w-8 place-content-center rounded-lg text-ink-400 hover:bg-white/60 lg:grid"
        aria-label="Fixar/recolher menu"
        @click="emit('toggle')"
      >
        <Icon :name="expanded ? 'menuOpen' : 'menu'" :size="18" />
      </button>
      <button
        class="ml-auto grid h-8 w-8 place-content-center rounded-lg text-ink-400 hover:bg-white/60 lg:hidden"
        aria-label="Fechar menu"
        @click="emit('close-mobile')"
      >
        <Icon name="x" :size="18" />
      </button>
    </div>

    <!-- nav -->
    <nav class="flex-1 space-y-1 px-3 py-2">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        :title="!expanded ? item.label : undefined"
        active-class="bg-white/70 text-sky-700 shadow-soft"
        exact-active-class="bg-white/70 text-sky-700 shadow-soft"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-600 transition hover:bg-white/60"
        @click="emit('close-mobile')"
      >
        <Icon :name="item.icon" :size="22" class="shrink-0" />
        <span v-show="expanded" class="truncate">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- footer -->
    <div class="border-t border-white/60 p-3">
      <div class="flex items-center gap-3">
        <div
          class="grid h-9 w-9 shrink-0 place-content-center rounded-full bg-pink-200/80 text-sm font-bold text-pink-700"
        >
          {{ initial }}
        </div>
        <div v-show="expanded" class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold text-ink-800">{{ displayName }}</div>
          <div class="truncate text-[11px] text-ink-500">@{{ username }}</div>
        </div>
        <button
          v-show="expanded"
          class="grid h-8 w-8 place-content-center rounded-lg text-ink-400 hover:bg-white/60"
          aria-label="Sair"
          @click="logout"
        >
          <Icon name="logout" :size="18" />
        </button>
      </div>
    </div>
  </aside>
</template>
