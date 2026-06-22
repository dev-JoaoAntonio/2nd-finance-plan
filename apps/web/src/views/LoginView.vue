<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFinanceStore } from '@/stores/finance';

const router = useRouter();
const auth = useAuthStore();
const finance = useFinanceStore();

const slides = ['/login/main.svg', '/login/slide-2.svg', '/login/slide-3.svg', '/login/slide-4.svg'];
const current = ref(0);
const paused = ref(false);
let timer: number | undefined;

function next() {
  current.value = (current.value + 1) % slides.length;
}
function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length;
}
function startAutoplay() {
  timer = window.setInterval(() => {
    if (!paused.value) next();
  }, 6000);
}
onMounted(startAutoplay);
onBeforeUnmount(() => timer && clearInterval(timer));

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function onSubmit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(username.value.trim(), password.value);
    finance.initialized = false;
    await router.replace({ name: 'dashboard' });
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Não foi possível entrar. Tente novamente.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- carrossel -->
    <div
      class="relative hidden overflow-hidden lg:block"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
    >
      <div
        v-for="(s, i) in slides"
        :key="s"
        class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        :style="{ backgroundImage: `url(${s})`, opacity: i === current ? 1 : 0 }"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
      <div class="absolute bottom-12 left-10 right-10 text-white">
        <p class="display text-3xl">O seu resumo financeiro.<br />O seu futuro.</p>
        <p class="mt-2 text-white/80">Valdeci</p>
      </div>
      <button class="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-content-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30" @click="prev">‹</button>
      <button class="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-content-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30" @click="next">›</button>
      <div class="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          v-for="(s, i) in slides"
          :key="`d${i}`"
          class="h-2 rounded-full transition-all"
          :class="i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'"
          @click="current = i"
        />
      </div>
    </div>

    <!-- formulário -->
    <div class="flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-pink-50 p-6">
      <div class="w-full max-w-sm">
        <h1 class="display text-3xl">Bem-vindo de volta!</h1>
        <p class="mt-1 text-ink-500">Entre para acompanhar seu mês.</p>

        <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
          <div>
            <label class="label">Usuário</label>
            <input v-model="username" class="login-input" autocomplete="username" placeholder="valdeci" />
          </div>
          <div>
            <label class="label">Senha</label>
            <input v-model="password" type="password" class="login-input" autocomplete="current-password" placeholder="••••••" />
          </div>
          <p v-if="error" class="text-sm font-medium text-rose-600">{{ error }}</p>
          <button type="submit" class="login-btn w-full" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="mt-10 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          <span class="h-px flex-1 bg-ink-200" />
          Finance Plan · Valdeci
          <span class="h-px flex-1 bg-ink-200" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  padding: 0.875rem 1.25rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.login-input:focus {
  border-color: #467a58;
  box-shadow: 0 0 0 3px #d9e7dc;
}
.login-btn {
  border-radius: 0.75rem;
  background: #a8675f;
  padding: 0.875rem 1.25rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
  transition: background 0.15s ease;
}
.login-btn:hover {
  background: #955650;
}
.login-btn:disabled {
  opacity: 0.6;
}
</style>
