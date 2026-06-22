<template>
  <q-dialog v-model="show" persistent @hide="onHide">
    <q-card class="fp-card" style="width: 520px; max-width: 95vw">
      <q-card-section class="row items-center bg-positive text-white q-py-md">
        <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="28px" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? 'Editar renda' : 'Adicionar renda' }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" aria-label="Fechar" v-close-popup />
      </q-card-section>

      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md q-pt-lg">
          <!-- Quanto -->
          <q-input
            v-model="amountText"
            label="Quanto você recebeu? (R$)"
            outlined
            inputmode="decimal"
            placeholder="Ex.: 3.500,00"
            :rules="[(v) => isValidAmount(v) || 'Informe um valor maior que zero (ex.: 3.500,00)']"
            autofocus
          >
            <template #prepend><q-icon name="payments" /></template>
          </q-input>

          <!-- De onde vem -->
          <q-input
            v-model="source"
            label="De onde veio esse dinheiro?"
            outlined
            placeholder="Ex.: Salário, Freelance, Aluguel"
            :rules="[(v) => (!!v && v.trim().length > 0) || 'Informe de onde vem o dinheiro']"
          >
            <template #prepend><q-icon name="account_balance" /></template>
          </q-input>

          <!-- Sugestões rápidas de origem (acessibilidade/agilidade) -->
          <div class="row items-center q-gutter-xs">
            <q-chip
              v-for="s in sourceSuggestions"
              :key="s"
              clickable
              outline
              color="positive"
              text-color="positive"
              :label="s"
              @click="source = s"
            />
          </div>

          <!-- Data -->
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

          <!-- Detalhes opcionais -->
          <q-input
            v-model="note"
            label="Detalhes (opcional)"
            outlined
            type="textarea"
            autogrow
            placeholder="Ex.: adiantamento, 13º salário, projeto X..."
          >
            <template #prepend><q-icon name="notes" /></template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-8" size="md" v-close-popup />
          <q-btn
            type="submit"
            unelevated
            color="positive"
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
import { useIncomeStore } from '@/stores/income';
import { apiErrorMessage } from '@/lib/api';
import { formatDate, todayISODate } from '@/lib/format';
import type { Income } from '@/lib/types';

const props = defineProps<{
  modelValue: boolean;
  income?: Income | null;
}>();
const emit = defineEmits<{
  'update:modelValue': [boolean];
  saved: [];
}>();

const $q = useQuasar();
const incomeStore = useIncomeStore();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const isEdit = computed(() => !!props.income);

const sourceSuggestions = ['Salário', 'Freelance', 'Aluguel', 'Vendas', 'Benefício', 'Investimentos'];

const amountText = ref('');
const source = ref('');
const note = ref('');
const dateISO = ref(todayISODate());
const saving = ref(false);

const displayDate = computed(() => (dateISO.value ? formatDate(dateISO.value) : ''));

// Reinicializa o formulário sempre que o diálogo abrir.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    if (props.income) {
      amountText.value = String(props.income.amount).replace('.', ',');
      source.value = props.income.source;
      note.value = props.income.note ?? '';
      dateISO.value = props.income.date.slice(0, 10);
    } else {
      amountText.value = '';
      source.value = '';
      note.value = '';
      dateISO.value = todayISODate();
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

async function onSubmit() {
  if (!isValidAmount(amountText.value) || source.value.trim().length === 0) return;
  saving.value = true;
  const amount = parseAmount(amountText.value);

  try {
    const payload = {
      amount,
      source: source.value.trim(),
      date: dateISO.value,
      note: note.value.trim() || null,
    };

    if (isEdit.value && props.income) {
      await incomeStore.update(props.income.id, payload);
      $q.notify({ type: 'positive', message: 'Renda atualizada.' });
    } else {
      await incomeStore.create(payload);
      $q.notify({ type: 'positive', message: 'Renda adicionada.' });
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
