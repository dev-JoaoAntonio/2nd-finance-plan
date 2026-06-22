<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '@/stores/finance';
import { useToastStore } from '@/stores/toast';
import CategoryModal from '@/components/CategoryModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import Icon from '@/components/Icon.vue';
import type { Category } from '@/types';

const finance = useFinanceStore();
const toast = useToastStore();
const { categories } = storeToRefs(finance);

const showModal = ref(false);
const editing = ref<Category | null>(null);
const toDelete = ref<Category | null>(null);
const saving = ref(false);

function openCreate() {
  editing.value = null;
  showModal.value = true;
}
function openEdit(c: Category) {
  editing.value = c;
  showModal.value = true;
}
async function save(payload: { name: string; color: string }) {
  saving.value = true;
  try {
    if (editing.value) {
      await finance.updateCategory(editing.value.id, payload);
      toast.success('Categoria atualizada.');
    } else {
      await finance.createCategory(payload);
      toast.success('Categoria criada.');
    }
    showModal.value = false;
  } finally {
    saving.value = false;
  }
}
async function confirmDelete() {
  if (!toDelete.value) return;
  saving.value = true;
  try {
    await finance.deleteCategory(toDelete.value.id);
    toast.success('Categoria removida.');
    toDelete.value = null;
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Não foi possível remover.');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="card p-5" v-reveal>
      <div class="flex items-center gap-3">
        <div class="grid h-9 w-9 place-content-center rounded-xl bg-sky-100 text-sky-600">
          <Icon name="list" :size="20" />
        </div>
        <h3 class="font-bold text-ink-900">Categorias de gastos</h3>
        <button class="btn-primary ml-auto !py-1.5" @click="openCreate">
          <Icon name="plus" :size="16" /> Nova
        </button>
      </div>

      <ul class="mt-4 space-y-2">
        <li
          v-for="c in categories"
          :key="c.id"
          class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5"
        >
          <span class="h-5 w-5 rounded-full" :style="{ background: c.color ?? '#94a3b8' }" />
          <span class="flex-1 text-sm font-medium text-ink-800">{{ c.name }}</span>
          <code class="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-ink-500">{{ c.color ?? '—' }}</code>
          <div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button class="grid h-8 w-8 place-content-center rounded-lg text-sky-600 hover:bg-sky-50" @click="openEdit(c)">
              <Icon name="edit" :size="16" />
            </button>
            <button class="grid h-8 w-8 place-content-center rounded-lg text-rose-600 hover:bg-rose-50" @click="toDelete = c">
              <Icon name="trash" :size="16" />
            </button>
          </div>
        </li>
        <li v-if="!categories.length" class="py-6 text-center text-sm text-ink-400">
          Nenhuma categoria ainda.
        </li>
      </ul>
    </div>

    <CategoryModal
      :open="showModal"
      :category="editing"
      :loading="saving"
      @close="showModal = false"
      @save="save"
    />
    <ConfirmModal
      :open="!!toDelete"
      :title="`Remover ${toDelete?.name ?? 'categoria'}?`"
      message="Não é possível remover se a categoria estiver em uso por alguma transação."
      :loading="saving"
      @close="toDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
