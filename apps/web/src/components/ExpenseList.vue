<template>
  <q-list separator>
    <q-item v-for="exp in expenses" :key="exp.id" class="q-py-md">
      <q-item-section avatar>
        <q-avatar :style="{ background: tint(exp) }" size="44px">
          <q-icon
            :name="exp.category?.icon ?? 'help'"
            size="24px"
            :style="{ color: exp.category?.color ?? '#64748b' }"
          />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-weight-bold" style="font-size: 1.05rem">
          {{ exp.description }}
        </q-item-label>
        <q-item-label caption style="font-size: 0.95rem">
          <q-icon name="event" size="16px" /> {{ formatDate(exp.date) }}
          <span class="q-mx-xs">•</span>
          <q-badge
            :style="{ backgroundColor: exp.category?.color ?? '#94a3b8' }"
            class="text-white"
          >
            {{ exp.category?.name ?? 'Sem categoria' }}
          </q-badge>
        </q-item-label>
      </q-item-section>

      <q-item-section side class="text-right">
        <div class="fp-amount text-negative" style="font-size: 1.15rem">
          {{ formatCurrency(exp.amount) }}
        </div>
        <div class="row no-wrap q-mt-xs">
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            size="md"
            aria-label="Editar gasto"
            @click="$emit('edit', exp)"
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
            aria-label="Excluir gasto"
            @click="confirmDelete(exp)"
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
import { useExpensesStore } from '@/stores/expenses';
import { formatCurrency, formatDate } from '@/lib/format';
import { apiErrorMessage } from '@/lib/api';
import type { Expense } from '@/lib/types';

defineProps<{ expenses: Expense[] }>();
const emit = defineEmits<{ edit: [Expense]; changed: [] }>();

const $q = useQuasar();
const expensesStore = useExpensesStore();

function tint(exp: Expense): string {
  return `${exp.category?.color ?? '#64748b'}1A`;
}

function confirmDelete(exp: Expense) {
  $q.dialog({
    title: 'Excluir gasto',
    message: `Excluir "${exp.description}" (${formatCurrency(exp.amount)})? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await expensesStore.remove(exp.id);
      $q.notify({ type: 'positive', message: 'Gasto excluído.' });
      emit('changed');
    } catch (e) {
      $q.notify({ type: 'negative', message: apiErrorMessage(e) });
    }
  });
}
</script>
