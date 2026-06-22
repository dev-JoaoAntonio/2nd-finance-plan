<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-gutter-y-md">
      <div class="fp-page-title">Minha renda</div>
      <q-btn
        unelevated
        color="positive"
        size="lg"
        icon="add_circle"
        label="Adicionar renda"
        @click="openCreate"
      />
    </div>

    <!-- Filtro de mês -->
    <q-card flat bordered class="fp-card q-mb-md">
      <q-card-section>
        <month-selector :model-value="store.month" @update:model-value="onMonth" />
      </q-card-section>
    </q-card>

    <!-- Total do período -->
    <div class="row items-center justify-between q-mb-sm q-px-sm">
      <div class="fp-muted">{{ store.items.length }} lançamento(s)</div>
      <div class="text-weight-bold" style="font-size: 1.1rem">
        Total: <span class="fp-amount text-positive">{{ formatCurrency(periodTotal) }}</span>
      </div>
    </div>

    <q-card flat bordered class="fp-card">
      <q-inner-loading :showing="store.loading" color="positive" />
      <income-list
        v-if="store.items.length"
        :incomes="store.items"
        @edit="openEdit"
        @changed="store.fetch"
      />
      <empty-state
        v-else-if="!store.loading"
        icon="savings"
        title="Nenhuma renda neste período"
        message="Toque em 'Adicionar renda' para registrar de onde vem o seu dinheiro."
      >
        <template #action>
          <q-btn
            class="q-mt-md"
            unelevated
            color="positive"
            size="lg"
            icon="add_circle"
            label="Adicionar renda"
            @click="openCreate"
          />
        </template>
      </empty-state>
    </q-card>

    <income-form-dialog v-model="showForm" :income="editing" @saved="onSaved" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useIncomeStore } from '@/stores/income';
import { formatCurrency } from '@/lib/format';
import MonthSelector from '@/components/MonthSelector.vue';
import IncomeList from '@/components/IncomeList.vue';
import IncomeFormDialog from '@/components/IncomeFormDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import type { Income } from '@/lib/types';

const store = useIncomeStore();

const showForm = ref(false);
const editing = ref<Income | null>(null);

const periodTotal = computed(() =>
  store.items.reduce((acc, i) => acc + i.amount, 0),
);

function onMonth(value: string) {
  void store.setMonth(value);
}

function openCreate() {
  editing.value = null;
  showForm.value = true;
}
function openEdit(inc: Income) {
  editing.value = inc;
  showForm.value = true;
}
function onSaved() {
  void store.fetch();
}

onMounted(() => {
  void store.fetch();
});
</script>
