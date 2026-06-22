<template>
  <q-layout view="hHh Lpr lff">
    <!-- Cabeçalho -->
    <q-header class="bg-primary text-white">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Abrir menu de navegação"
          class="lt-md"
          size="lg"
          @click="drawer = !drawer"
        />
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon :name="brand.logoIcon" size="32px" class="q-mr-sm" />
          <span class="text-weight-bold">{{ brand.shortName }}</span>
        </q-toolbar-title>

        <!-- Controle de tamanho de letra (acessibilidade) -->
        <div
          v-if="brand.accessibility.showFontControl"
          class="row items-center no-wrap q-gutter-xs"
        >
          <q-btn
            flat
            round
            size="md"
            icon="text_decrease"
            aria-label="Diminuir tamanho da letra"
            :disable="ui.fontIndex === 0"
            @click="ui.decrease()"
          >
            <q-tooltip>Diminuir letra</q-tooltip>
          </q-btn>
          <span class="text-weight-bold" style="font-size: 0.9rem">Letra</span>
          <q-btn
            flat
            round
            size="md"
            icon="text_increase"
            aria-label="Aumentar tamanho da letra"
            :disable="ui.fontIndex === ui.levels.length - 1"
            @click="ui.increase()"
          >
            <q-tooltip>Aumentar letra</q-tooltip>
          </q-btn>
        </div>

        <q-btn
          flat
          no-caps
          class="q-ml-sm"
          icon="account_circle"
          :label="$q.screen.gt.sm ? firstName : ''"
          aria-label="Conta e opções"
        >
          <q-menu>
            <q-list style="min-width: 220px">
              <q-item v-ripple clickable :to="{ name: 'account' }">
                <q-item-section avatar><q-icon name="settings" /></q-item-section>
                <q-item-section>Minha conta</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-ripple clickable @click="confirmLogout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Sair</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Navegação lateral -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :breakpoint="1023"
      bordered
      class="bg-white"
    >
      <q-list padding class="q-pt-md">
        <q-item
          v-for="item in nav"
          :key="item.name"
          v-ripple
          clickable
          :to="{ name: item.name }"
          exact
          active-class="fp-nav-active"
          class="q-mb-sm rounded-borders"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="30px" />
          </q-item-section>
          <q-item-section class="text-weight-bold">{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Conteúdo -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { activeBrand as brand } from '@/brands';

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const drawer = ref(false);

const firstName = computed(() => auth.user?.name?.split(' ')[0] ?? 'Conta');

const nav = [
  { name: 'dashboard', label: 'Início', icon: 'home' },
  { name: 'income', label: 'Minha renda', icon: 'savings' },
  { name: 'expenses', label: 'Meus gastos', icon: 'receipt_long' },
  { name: 'categories', label: 'Categorias', icon: 'sell' },
  { name: 'account', label: 'Minha conta', icon: 'account_circle' },
];

function confirmLogout() {
  $q.dialog({
    title: 'Sair',
    message: 'Deseja realmente sair da sua conta?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Sair', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(() => {
    auth.logout();
    void router.replace({ name: 'login' });
  });
}
</script>

<style scoped>
.fp-nav-active {
  background: var(--fp-nav-active-bg);
  color: var(--fp-nav-active-fg);
}
.fp-nav-active :deep(.q-icon) {
  color: var(--fp-nav-active-fg);
}
</style>
