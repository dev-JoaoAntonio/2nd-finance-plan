<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="fp-page-title q-mb-lg">Minha conta</div>

    <div class="row q-col-gutter-md">
      <!-- Perfil -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="fp-card full-height">
          <q-card-section>
            <div class="fp-section-title q-mb-md">Seus dados</div>
            <q-item class="q-px-none">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" size="56px">
                  {{ initials }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold" style="font-size: 1.15rem">
                  {{ auth.user?.name }}
                </q-item-label>
                <q-item-label caption style="font-size: 1rem">
                  {{ auth.user?.email }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-card-section>
        </q-card>
      </div>

      <!-- Acessibilidade: tamanho da letra -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="fp-card full-height">
          <q-card-section>
            <div class="fp-section-title q-mb-sm">Tamanho da letra</div>
            <div class="fp-muted q-mb-md">
              Deixe o texto do tamanho mais confortável para você.
            </div>
            <div class="row items-center justify-center q-gutter-md">
              <q-btn
                round
                color="primary"
                icon="text_decrease"
                size="lg"
                aria-label="Diminuir letra"
                :disable="ui.fontIndex === 0"
                @click="ui.decrease()"
              />
              <div class="text-center" style="min-width: 90px">
                <div class="text-weight-bold" style="font-size: 1.3rem">
                  {{ ui.fontIndex + 1 }} / {{ ui.levels.length }}
                </div>
                <div class="fp-muted">nível</div>
              </div>
              <q-btn
                round
                color="primary"
                icon="text_increase"
                size="lg"
                aria-label="Aumentar letra"
                :disable="ui.fontIndex === ui.levels.length - 1"
                @click="ui.increase()"
              />
            </div>
            <q-banner class="bg-grey-2 rounded-borders q-mt-md">
              Exemplo: este é o tamanho atual do texto.
            </q-banner>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ferramentas -->
      <div class="col-12">
        <q-card flat bordered class="fp-card">
          <q-card-section>
            <div class="fp-section-title q-mb-sm">Ferramentas</div>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    Reorganizar gastos sem categoria
                  </q-item-label>
                  <q-item-label caption>
                    Aplica as palavras-chave nos gastos que ainda estão sem categoria.
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    outline
                    color="primary"
                    icon="auto_fix_high"
                    label="Reorganizar"
                    :loading="recategorizing"
                    @click="recategorize"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sair -->
      <div class="col-12">
        <q-btn
          outline
          color="negative"
          size="lg"
          icon="logout"
          label="Sair da conta"
          @click="confirmLogout"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const recategorizing = ref(false);

const initials = computed(() => {
  const n = auth.user?.name?.trim() ?? '';
  const parts = n.split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
});

async function recategorize() {
  recategorizing.value = true;
  try {
    const { data } = await api.post<{ updated: number }>('/expenses/recategorize');
    $q.notify({
      type: 'positive',
      message:
        data.updated > 0
          ? `${data.updated} gasto(s) categorizado(s).`
          : 'Nenhum gasto sem categoria encontrado.',
    });
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  } finally {
    recategorizing.value = false;
  }
}

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
