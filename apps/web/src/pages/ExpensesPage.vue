<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-gutter-y-md">
      <div class="fp-page-title">Meus gastos</div>
      <q-btn
        unelevated
        color="primary"
        size="lg"
        icon="add_circle"
        label="Adicionar gasto"
        @click="openCreate"
      />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="fp-card q-mb-md">
      <q-card-section class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <month-selector :model-value="store.month" @update:model-value="onMonth" />
        </div>
        <div class="col-12 col-md-4">
          <q-select
            :model-value="store.categoryFilter"
            :options="filterOptions"
            label="Filtrar por categoria"
            outlined
            dense
            emit-value
            map-options
            clearable
            @update:model-value="onFilter"
          >
            <template #prepend><q-icon name="filter_list" /></template>
          </q-select>
        </div>
      </q-card-section>
    </q-card>

    <!-- Total do período -->
    <div class="row items-center justify-between q-mb-sm q-px-sm">
      <div class="fp-muted">{{ store.items.length }} lançamento(s)</div>
      <div class="text-weight-bold" style="font-size: 1.1rem">
        Total: <span class="fp-amount">{{ formatCurrency(periodTotal) }}</span>
      </div>
    </div>

    <q-card flat bordered class="fp-card">
      <q-inner-loading :showing="store.loading" color="primary" />
      <expense-list
        v-if="store.items.length"
        :expenses="store.items"
        @edit="openEdit"
        @changed="store.fetch"
      />
      <empty-state
        v-else-if="!store.loading"
        icon="receipt_long"
        title="Nenhum gasto neste período"
        message="Toque em 'Adicionar gasto' para registrar o primeiro."
      >
        <template #action>
          <q-btn
            class="q-mt-md"
            unelevated
            color="primary"
            size="lg"
            icon="add_circle"
            label="Adicionar gasto"
            @click="openCreate"
          />
        </template>
      </empty-state>
    </q-card>

    <expense-form-dialog
      v-model="showForm"
      :expense="editing"
      :categories="categories.items"
      @saved="onSaved"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useExpensesStore } from '@/stores/expenses';
import { useCategoriesStore } from '@/stores/categories';
import { formatCurrency } from '@/lib/format';
import MonthSelector from '@/components/MonthSelector.vue';
import ExpenseList from '@/components/ExpenseList.vue';
import ExpenseFormDialog from '@/components/ExpenseFormDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import type { Expense } from '@/lib/types';

const store = useExpensesStore();
const categories = useCategoriesStore();

const showForm = ref(false);
const editing = ref<Expense | null>(null);

const filterOptions = computed(() =>
  categories.items.map((c) => ({ label: c.name, value: c.id })),
);

const periodTotal = computed(() =>
  store.items.reduce((acc, e) => acc + e.amount, 0),
);

function onMonth(value: string) {
  void store.setMonth(value);
}
function onFilter(value: string | null) {
  void store.setCategoryFilter(value);
}

function openCreate() {
  editing.value = null;
  showForm.value = true;
}
function openEdit(exp: Expense) {
  editing.value = exp;
  showForm.value = true;
}
function onSaved() {
  void store.fetch();
}

onMounted(() => {
  void categories.fetchAll();
  void store.fetch();
});
</script>
