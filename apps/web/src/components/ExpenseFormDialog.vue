<template>
  <q-dialog v-model="show" persistent @hide="onHide">
    <q-card class="fp-card" style="width: 520px; max-width: 95vw">
      <q-card-section class="row items-center bg-primary text-white q-py-md">
        <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="28px" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? 'Editar gasto' : 'Adicionar gasto' }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" aria-label="Fechar" v-close-popup />
      </q-card-section>

      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            v-model="amountText"
            label="Valor (R$)"
            outlined
            inputmode="decimal"
            placeholder="Ex.: 49,90"
            :rules="[(v) => isValidAmount(v) || 'Informe um valor maior que zero (ex.: 49,90)']"
            autofocus
          >
            <template #prepend><q-icon name="payments" /></template>
          </q-input>

          <q-input
            v-model="description"
            label="No que você gastou?"
            outlined
            placeholder="Ex.: Compras no supermercado"
            :rules="[(v) => (!!v && v.trim().length > 0) || 'Descreva o gasto']"
            @blur="maybeSuggest"
          >
            <template #prepend><q-icon name="notes" /></template>
          </q-input>

          <q-input
            v-model="displayDate"
            label="Data"
            outlined
            readonly
            :rules="[(v) => !!v || 'Escolha a data']"
          >
            <template #prepend><q-icon name="event" /></template>
            <template #append>
              <q-icon name="calendar_month" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateISO" mask="YYYY-MM-DD" today-btn>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="OK" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="categoryValue"
            :options="categoryOptions"
            label="Categoria"
            outlined
            emit-value
            map-options
            options-dense
          >
            <template #prepend><q-icon name="sell" /></template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon
                    :name="scope.opt.icon"
                    :style="{ color: scope.opt.color || '#64748b' }"
                  />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-banner
            v-if="!isEdit && categoryValue === AUTO"
            dense
            class="text-primary rounded-borders"
            style="font-size: 0.95rem; background-color: var(--fp-nav-active-bg)"
          >
            <template #avatar><q-icon name="auto_awesome" color="primary" /></template>
            A categoria será sugerida automaticamente pela descrição. Você poderá trocar depois.
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-8" size="md" v-close-popup />
          <q-btn
            type="submit"
            unelevated
            color="primary"
            size="md"
            :label="isEdit ? 'Salvar' : 'Adicionar'"
            :loading="saving"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useExpensesStore } from '@/stores/expenses';
import { apiErrorMessage } from '@/lib/api';
import { activeBrand as brand } from '@/brands';
import { formatDate, todayISODate } from '@/lib/format';
import type { Category, Expense } from '@/lib/types';

const AUTO = '__auto__';
const NONE = '__none__';

const props = defineProps<{
  modelValue: boolean;
  expense?: Expense | null;
  categories: Category[];
}>();
const emit = defineEmits<{
  'update:modelValue': [boolean];
  saved: [];
}>();

const $q = useQuasar();
const expensesStore = useExpensesStore();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const isEdit = computed(() => !!props.expense);

const amountText = ref('');
const description = ref('');
const dateISO = ref(todayISODate());
const categoryValue = ref<string>(AUTO);
const saving = ref(false);

const displayDate = computed(() => (dateISO.value ? formatDate(dateISO.value) : ''));

const categoryOptions = computed(() => {
  const cats = props.categories.map((c) => ({
    label: c.name,
    value: c.id,
    icon: c.icon,
    color: c.color,
  }));
  const head = isEdit.value
    ? [{ label: 'Sem categoria', value: NONE, icon: 'block', color: '#94a3b8' }]
    : [{ label: 'Sugerir automaticamente', value: AUTO, icon: 'auto_awesome', color: brand.colors.primary }];
  return [...head, ...cats];
});

// Reinicializa o formulário sempre que o diálogo abrir.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.expense) {
      amountText.value = String(props.expense.amount).replace('.', ',');
      description.value = props.expense.description;
      dateISO.value = props.expense.date.slice(0, 10);
      categoryValue.value = props.expense.categoryId ?? NONE;
    } else {
      amountText.value = '';
      description.value = '';
      dateISO.value = todayISODate();
      categoryValue.value = AUTO;
    }
  },
);

function parseAmount(s: string): number {
  let v = (s ?? '').trim().replace(/\s/g, '');
  if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function isValidAmount(s: string): boolean {
  const n = parseAmount(s);
  return Number.isFinite(n) && n > 0;
}

// Quando o usuário sai do campo de descrição e ainda está em "automático",
// não precisamos prever no cliente — o servidor sugere ao salvar. (placeholder p/ futuro)
function maybeSuggest() {}

async function onSubmit() {
  if (!isValidAmount(amountText.value)) return;
  saving.value = true;
  const amount = parseAmount(amountText.value);

  try {
    if (isEdit.value && props.expense) {
      const payload: Record<string, unknown> = {
        amount,
        description: description.value.trim(),
        date: dateISO.value,
      };
      if (categoryValue.value === NONE) payload.clearCategory = true;
      else payload.categoryId = categoryValue.value;

      await expensesStore.update(props.expense.id, payload);
      $q.notify({ type: 'positive', message: 'Gasto atualizado.' });
    } else {
      const payload: Record<string, unknown> = {
        amount,
        description: description.value.trim(),
        date: dateISO.value,
      };
      if (categoryValue.value !== AUTO) payload.categoryId = categoryValue.value;

      const created = await expensesStore.create(payload as never);
      if (created.autoCategorized && created.category) {
        $q.notify({
          type: 'info',
          icon: 'auto_awesome',
          message: `Categorizado automaticamente como "${created.category.name}".`,
        });
      } else {
        $q.notify({ type: 'positive', message: 'Gasto adicionado.' });
      }
    }
    emit('saved');
    show.value = false;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  } finally {
    saving.value = false;
  }
}

function onHide() {
  saving.value = false;
}
</script>
