<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFinanceStore } from '@/stores/finance';

const router = useRouter();
const auth = useAuthStore();
const finance = useFinanceStore();

const slides = [
  '/login/slide-1.jpg',
  '/login/slide-2.jpg',
  '/login/slide-3.jpg',
  '/login/slide-4.jpg',
  '/login/slide-5.jpg',
];
const current = ref(0);
const paused = ref(false);
let timer: number | undefined;

function next() {
  current.value = (current.value + 1) % slides.length;
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
  <div class="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-8">
    <div
      class="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] lg:grid-cols-2"
    >
      <!-- formulário -->
      <div class="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div class="w-full max-w-sm">
          <h1 class="display text-4xl leading-[1.05] sm:text-5xl">Bem-vindo de volta!</h1>

          <form class="mt-10 space-y-4" @submit.prevent="onSubmit">
            <p class="text-sm font-semibold text-ink-800">Acesse com a sua conta</p>

            <input
              v-model="username"
              class="login-input"
              autocomplete="username"
              aria-label="Usuário"
              placeholder="Usuário"
            />
            <input
              v-model="password"
              type="password"
              class="login-input"
              autocomplete="current-password"
              aria-label="Senha"
              placeholder="Senha"
            />

            <p class="text-right text-xs font-medium text-ink-400">Esqueceu a senha? Fale com o admin.</p>

            <p v-if="error" class="text-sm font-medium text-rose-600">{{ error }}</p>

            <button type="submit" class="login-btn w-full" :disabled="loading">
              {{ loading ? 'Entrando...' : 'Entrar' }}
            </button>
          </form>

          <div
            class="mt-9 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400"
          >
            <span class="h-px flex-1 bg-ink-200" />
            Finance Plan · Valdeci
            <span class="h-px flex-1 bg-ink-200" />
          </div>
        </div>
      </div>

      <!-- carrossel -->
      <div
        class="relative hidden p-3 lg:block"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <div class="relative h-full w-full overflow-hidden rounded-3xl">
          <div
            v-for="(s, i) in slides"
            :key="s"
            class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            :style="{ backgroundImage: `url(${s})`, opacity: i === current ? 1 : 0 }"
          />
          <div
            class="absolute inset-0"
            style="background-image: linear-gradient(to top, rgba(10, 16, 32, 0.85) 0%, rgba(10, 16, 32, 0) 60%)"
          />

          <div class="absolute inset-x-0 bottom-0 flex flex-col items-center px-6 pb-9 text-center text-white">
            <p class="display text-2xl leading-tight text-white sm:text-3xl">O seu resumo financeiro.<br />O seu futuro.</p>
            <p class="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/75">Valdeci</p>

            <div class="mt-5 flex gap-2">
              <button
                v-for="(s, i) in slides"
                :key="`d${i}`"
                type="button"
                :aria-label="`Ir para imagem ${i + 1}`"
                class="h-2 rounded-full transition-all"
                :class="i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'"
                @click="current = i"
              />
            </div>
          </div>
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
.login-input::placeholder {
  color: #9aa3af;
}
.login-input:focus {
  border-color: #467a58;
  box-shadow: 0 0 0 3px #d9e7dc;
}
.login-btn {
  border-radius: 0.75rem;
  background: #3e6b4f; /* verde musgo — primária Valdeci (sky-600) */
  padding: 0.875rem 1.25rem;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
  transition: background 0.15s ease;
}
.login-btn:hover {
  background: #2f5740; /* sky-700 */
}
.login-btn:disabled {
  opacity: 0.6;
}
</style>
