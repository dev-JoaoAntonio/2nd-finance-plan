<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import DatePicker from './DatePicker.vue';
import Select from './Select.vue';
import Spinner from './Spinner.vue';
import { parseInput } from '@/utils/format';
import type { Category, Transaction } from '@/types';

const props = defineProps<{
  open: boolean;
  transaction: Transaction | null;
  categories: Category[];
  defaultDate: string;
  loading?: boolean;
}>();
const emit = defineEmits<{
  close: [];
  save: [{ amount: number; categoryId: string; occurredAt: string; description: string | null }];
}>();

const amount = ref('');
const categoryId = ref<string | null>(null);
const occurredAt = ref<string | null>(null);
const description = ref('');

watch(
  () => props.open,
  (o) => {
    if (!o) return;
    if (props.transaction) {
      amount.value = props.transaction.amount.toFixed(2).replace('.', ',');
      categoryId.value = props.transaction.categoryId;
      occurredAt.value = props.transaction.occurredAt;
      description.value = props.transaction.description ?? '';
    } else {
      amount.value = '';
      categoryId.value = props.categories[0]?.id ?? null;
      occurredAt.value = props.defaultDate;
      description.value = '';
    }
  },
);

function submit() {
  const value = parseInput(amount.value);
  if (value <= 0 || !categoryId.value || !occurredAt.value) return;
  emit('save', {
    amount: value,
    categoryId: categoryId.value,
    occurredAt: occurredAt.value,
    description: description.value.trim() || null,
  });
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="transaction ? 'Editar transação' : 'Nova transação'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Valor (R$)</label>
        <input
          v-model="amount"
          class="input font-mono"
          inputmode="decimal"
          placeholder="0,00"
          autofocus
        />
      </div>
      <div>
        <label class="label">Data</label>
        <DatePicker v-model="occurredAt" />
      </div>
      <div>
        <label class="label">Categoria</label>
        <Select
          v-model="categoryId"
          :options="categories.map((c) => ({ value: c.id, label: c.name, color: c.color }))"
          placeholder="Escolha a categoria"
        />
      </div>
      <div>
        <label class="label">Descrição</label>
        <input v-model="description" class="input" placeholder="Ex.: Mercado da esquina" />
      </div>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn-ghost" @click="emit('close')">Cancelar</button>
      <button class="btn-primary" :disabled="loading" @click="submit">
        <Spinner v-if="loading" :size="14" />
        {{ transaction ? 'Salvar' : 'Adicionar' }}
      </button>
    </template>
  </BaseModal>
</template>
