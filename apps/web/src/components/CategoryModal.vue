<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import Spinner from './Spinner.vue';
import type { Category } from '@/types';

const PALETTE = [
  '#0ea5e9',
  '#ec4899',
  '#10b981',
  '#f97316',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
  '#14b8a6',
  '#84cc16',
  '#a855f7',
  '#06b6d4',
  '#64748b',
];

const props = defineProps<{ open: boolean; category: Category | null; loading?: boolean }>();
const emit = defineEmits<{ close: []; save: [{ name: string; color: string }] }>();

const name = ref('');
const color = ref(PALETTE[0]);

watch(
  () => props.open,
  (o) => {
    if (!o) return;
    name.value = props.category?.name ?? '';
    color.value = props.category?.color ?? PALETTE[0];
  },
);

function submit() {
  if (!name.value.trim()) return;
  emit('save', { name: name.value.trim(), color: color.value });
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="category ? 'Editar categoria' : 'Nova categoria'"
    @close="emit('close')"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="label">Nome</label>
        <input v-model="name" class="input" placeholder="Ex.: Mercado" autofocus />
      </div>
      <div>
        <label class="label">Cor</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="c in PALETTE"
            :key="c"
            type="button"
            class="h-8 w-8 rounded-full ring-offset-2 transition"
            :class="color === c ? 'ring-2 ring-ink-400' : ''"
            :style="{ background: c }"
            @click="color = c"
          />
          <label class="grid h-8 w-8 cursor-pointer place-content-center rounded-full border border-dashed border-ink-300 text-[10px] text-ink-400">
            <input v-model="color" type="color" class="sr-only" />
            +
          </label>
        </div>
      </div>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <button class="btn-ghost" @click="emit('close')">Cancelar</button>
      <button class="btn-primary" :disabled="loading" @click="submit">
        <Spinner v-if="loading" :size="14" />
        {{ category ? 'Salvar' : 'Criar' }}
      </button>
    </template>
  </BaseModal>
</template>
