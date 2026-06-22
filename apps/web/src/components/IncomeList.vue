<template>
  <q-list separator>
    <q-item v-for="inc in incomes" :key="inc.id" class="q-py-md">
      <q-item-section avatar>
        <q-avatar style="background: #21ba451a" size="44px">
          <q-icon name="account_balance" size="24px" color="positive" />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-bold" style="font-size: 1.05rem">
          {{ inc.source }}
        </q-item-label>
        <q-item-label caption style="font-size: 0.95rem">
          <q-icon name="event" size="16px" /> {{ formatDate(inc.date) }}
          <template v-if="inc.note">
            <span class="q-mx-xs">•</span>{{ inc.note }}
          </template>
        </q-item-label>
      </q-item-section>

      <q-item-section side class="text-right">
        <div class="fp-amount text-positive" style="font-size: 1.15rem">
          {{ formatCurrency(inc.amount) }}
        </div>
        <div class="row no-wrap q-mt-xs">
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            size="md"
            aria-label="Editar renda"
            @click="$emit('edit', inc)"
          >
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            size="md"
            aria-label="Excluir renda"
            @click="confirmDelete(inc)"
          >
            <q-tooltip>Excluir</q-tooltip>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useIncomeStore } from '@/stores/income';
import { formatCurrency, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import type { Income } from '@/lib/types';

defineProps<{ incomes: Income[] }>();
const emit = defineEmits<{ edit: [Income]; changed: [] }>();

const $q = useQuasar();
const incomeStore = useIncomeStore();

function confirmDelete(inc: Income) {
  $q.dialog({
    title: 'Excluir renda',
    message: `Excluir "${inc.source}" (${formatCurrency(inc.amount)})? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await incomeStore.remove(inc.id);
      $q.notify({ type: 'positive', message: 'Renda excluída.' });
      emit('changed');
    } catch (e) {
      $q.notify({ type: 'negative', message: apiErrorMessage(e) });
    }
  });
}
</script>
