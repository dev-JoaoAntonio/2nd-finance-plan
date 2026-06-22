<template>
  <q-card flat bordered class="fp-card q-pa-lg">
    <div class="fp-section-title q-mb-md">{{ brand.copy.loginTitle }}</div>

    <q-form @submit.prevent="onSubmit">
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
        label="Senha"
        outlined
        autocomplete="current-password"
        :rules="[(v) => !!v || 'Informe sua senha']"
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
        label="Entrar"
        :loading="loading"
      />
    </q-form>

    <div class="text-center q-mt-lg" style="font-size: 1.05rem">
      Ainda não tem conta?
      <router-link :to="{ name: 'register' }" class="text-primary text-weight-bold">
        Criar conta
      </router-link>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { apiErrorMessage } from '@/lib/api';
import { activeBrand as brand } from '@/brands';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const showPwd = ref(false);
const loading = ref(false);

async function onSubmit() {
  loading.value = true;
  try {
    await auth.login(email.value.trim(), password.value);
    const redirect = (route.query.redirect as string) || undefined;
    await router.replace(redirect ?? { name: 'dashboard' });
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  } finally {
    loading.value = false;
  }
}
</script>
