<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import Spinner from './Spinner.vue';

const props = defineProps<{ open: boolean; loading?: boolean }>();
const emit = defineEmits<{ close: []; save: [string] }>();

const title = ref('');

watch(
  () => props.open,
  (o) => {
    if (o) title.value = '';
  },
);

function submit() {
  if (!title.value.trim()) return;
  emit('save', title.value.trim());
}
</script>

<template>
  <BaseModal :open="open" title="Nova conquista" @close="emit('close')">
    <form @submit.prevent="submit">
      <label class="label">Nome da conquista</label>
      <input v-model="title" class="input" placeholder="Ex.: Quitar o cartão" autofocus />
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn-ghost" @click="emit('close')">Cancelar</button>
      <button class="btn-primary" :disabled="loading" @click="submit">
        <Spinner v-if="loading" :size="14" />
        Adicionar
      </button>
    </template>
  </BaseModal>
</template>
