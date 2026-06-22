<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import Spinner from './Spinner.vue';

withDefaults(
  defineProps<{ open: boolean; title?: string; message?: string; loading?: boolean }>(),
  {
    title: 'Excluir item?',
    message: 'Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.',
  },
);
const emit = defineEmits<{ close: []; confirm: [] }>();
</script>

<template>
  <BaseModal :open="open" :title="title" @close="emit('close')">
    <p class="text-sm text-ink-600">{{ message }}</p>
    <template #footer>
      <button class="btn-ghost" @click="emit('close')">Cancelar</button>
      <button class="btn-danger" :disabled="loading" @click="emit('confirm')">
        <Spinner v-if="loading" :size="14" />
        {{ loading ? 'Excluindo...' : 'Excluir' }}
      </button>
    </template>
  </BaseModal>
</template>
