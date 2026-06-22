<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import Spinner from './Spinner.vue';
import { parseInput } from '@/utils/format';
import type { ComputedExpense, ExpenseType } from '@/types';

const props = defineProps<{
  open: boolean;
  type: ExpenseType;
  expense: ComputedExpense | null;
  loading?: boolean;
}>();
const emit = defineEmits<{
  close: [];
  save: [{ title: string; description: string | null; amount: number }];
}>();

const title = ref('');
const description = ref('');
const amount = ref('');

watch(
  () => props.open,
  (o) => {
    if (!o) return;
    if (props.expense) {
      title.value = props.expense.title;
      description.value = props.expense.description ?? '';
      amount.value = props.expense.amount.toFixed(2).replace('.', ',');
    } else {
      title.value = '';
      description.value = '';
      amount.value = '';
    }
  },
);

function submit() {
  const value = parseInput(amount.value);
  if (!title.value.trim() || value < 0) return;
  emit('save', {
    title: title.value.trim(),
    description: description.value.trim() || null,
    amount: value,
  });
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="expense ? 'Editar passivo fixo' : 'Novo passivo fixo'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Identificação</label>
        <input v-model="title" class="input" placeholder="Ex.: Aluguel" autofocus />
      </div>
      <div>
        <label class="label">Detalhes (opcional)</label>
        <input v-model="description" class="input" placeholder="Ex.: vence dia 5" />
      </div>
      <div>
        <label class="label">Orçamento planejado (R$)</label>
        <input v-model="amount" class="input font-mono" inputmode="decimal" placeholder="0,00" />
      </div>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn-ghost" @click="emit('close')">Cancelar</button>
      <button class="btn-primary" :disabled="loading" @click="submit">
        <Spinner v-if="loading" :size="14" />
        {{ expense ? 'Salvar' : 'Adicionar' }}
      </button>
    </template>
  </BaseModal>
</template>
