<template>
  <q-card flat bordered class="fp-card q-pa-lg">
    <div class="fp-section-title q-mb-md">{{ brand.copy.registerTitle }}</div>

    <q-form @submit.prevent="onSubmit">
      <q-input
        v-model="name"
        label="Seu nome"
        outlined
        autocomplete="name"
        :rules="[(v) => (v && v.trim().length >= 2) || 'Informe seu nome']"
        class="q-mb-md"
      >
        <template #prepend><q-icon name="person" /></template>
      </q-input>

      <q-input
        v-model="email"
        type="email"
        label="E-mail"
        outlined
        autocomplete="email"
        :rules="[(v) => !!v || 'Informe seu e-mail']"
        class="q-mb-md"
      >
        <template #prepend><q-icon name="mail" /></template>
      </q-input>

      <q-input
        v-model="password"
        :type="showPwd ? 'text' : 'password'"
        label="Senha (mínimo 6 caracteres)"
        outlined
        autocomplete="new-password"
        :rules="[(v) => (v && v.length >= 6) || 'A senha precisa ter pelo menos 6 caracteres']"
        class="q-mb-md"
      >
        <template #prepend><q-icon name="lock" /></template>
        <template #append>
          <q-btn
            flat
            round
            :icon="showPwd ? 'visibility_off' : 'visibility'"
            :aria-label="showPwd ? 'Ocultar senha' : 'Mostrar senha'"
            @click="showPwd = !showPwd"
          />
        </template>
      </q-input>

      <q-btn
        type="submit"
        color="primary"
        unelevated
        class="full-width q-py-sm"
        size="lg"
        label="Criar conta"
        :loading="loading"
      />
    </q-form>

    <div class="text-center q-mt-lg" style="font-size: 1.05rem">
      Já tem conta?
      <router-link :to="{ name: 'login' }" class="text-primary text-weight-bold">
        Entrar
      </router-link>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiErrorMessage } from '@/lib/api';
import { activeBrand as brand } from '@/brands';

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPwd = ref(false);
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await auth.register(name.value.trim(), email.value.trim(), password.value);
    $q.notify({ type: 'positive', message: `Bem-vindo(a), ${name.value.split(' ')[0]}!` });
    await router.replace({ name: 'dashboard' });
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  } finally {
    loading.value = false;
  }
}
</script>
