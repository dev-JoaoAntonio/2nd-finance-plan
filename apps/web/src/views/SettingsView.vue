<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import Icon from '@/components/Icon.vue';
import Spinner from '@/components/Spinner.vue';

const auth = useAuthStore();
const toast = useToastStore();

const current = ref('');
const next = ref('');
const confirm = ref('');
const loading = ref(false);

async function changePassword() {
  if (next.value.length < 6) {
    toast.error('A nova senha deve ter ao menos 6 caracteres.');
    return;
  }
  if (next.value !== confirm.value) {
    toast.error('A confirmação não confere.');
    return;
  }
  loading.value = true;
  try {
    await auth.changePassword(current.value, next.value);
    current.value = '';
    next.value = '';
    confirm.value = '';
    toast.success('Senha alterada com sucesso!');
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Não foi possível alterar a senha.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="card p-5" v-reveal>
      <div class="kicker">Conta · Credenciais</div>
      <div class="mt-1 flex items-center gap-3">
        <div class="grid h-9 w-9 place-content-center rounded-xl bg-sky-100 text-sky-600">
          <Icon name="lock" :size="20" />
        </div>
        <h3 class="font-bold text-ink-900">Alterar senha</h3>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="changePassword">
        <div>
          <label class="label">Senha atual</label>
          <input v-model="current" type="password" class="input" autocomplete="current-password" />
        </div>
        <div>
          <label class="label">Nova senha</label>
          <input v-model="next" type="password" class="input" autocomplete="new-password" />
        </div>
        <div>
          <label class="label">Confirmar nova senha</label>
          <input v-model="confirm" type="password" class="input" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          <Spinner v-if="loading" :size="14" />
          Salvar nova senha
        </button>
      </form>
    </div>
  </div>
</template>
