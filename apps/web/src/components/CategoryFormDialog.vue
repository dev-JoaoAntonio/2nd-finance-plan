<template>
  <q-dialog v-model="show" persistent>
    <q-card class="fp-card" style="width: 480px; max-width: 95vw">
      <q-card-section class="row items-center bg-primary text-white q-py-md">
        <q-icon :name="isEdit ? 'edit' : 'add_circle'" size="26px" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">
          {{ isEdit ? 'Editar categoria' : 'Nova categoria' }}
        </div>
        <q-space />
        <q-btn flat round dense icon="close" aria-label="Fechar" v-close-popup />
      </q-card-section>

      <q-form @submit.prevent="onSubmit">
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input
            v-model="name"
            label="Nome da categoria"
            outlined
            :rules="[(v) => (!!v && v.trim().length > 0) || 'Informe o nome']"
            autofocus
          />

          <div>
            <div class="fp-muted q-mb-sm">Cor</div>
            <div class="row q-gutter-sm">
              <div
                v-for="c in palette"
                :key="c"
                class="fp-swatch"
                :class="{ 'fp-swatch--active': color === c }"
                :style="{ background: c }"
                role="button"
                :aria-label="`Escolher cor ${c}`"
                @click="color = c"
              >
                <q-icon v-if="color === c" name="check" color="white" size="20px" />
              </div>
            </div>
          </div>

          <q-select
            v-model="icon"
            :options="iconOptions"
            label="Ícone"
            outlined
            emit-value
            map-options
          >
            <template #prepend><q-icon :name="icon" :style="{ color }" /></template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.value" :style="{ color }" />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-8" v-close-popup />
          <q-btn type="submit" unelevated color="primary" :label="isEdit ? 'Salvar' : 'Criar'" :loading="saving" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useCategoriesStore } from '@/stores/categories';
import { apiErrorMessage } from '@/lib/api';
import type { Category } from '@/lib/types';

const props = defineProps<{ modelValue: boolean; category?: Category | null }>();
const emit = defineEmits<{ 'update:modelValue': [boolean]; saved: [] }>();

const $q = useQuasar();
const store = useCategoriesStore();

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const isEdit = computed(() => !!props.category);

const palette = [
  '#059669', '#0369A1', '#D97706', '#DC2626', '#7C3AED',
  '#2563EB', '#DB2777', '#475569', '#0891B2', '#65A30D',
];

const iconOptions = [
  { label: 'Alimentação', value: 'restaurant' },
  { label: 'Casa', value: 'home' },
  { label: 'Transporte', value: 'directions_car' },
  { label: 'Saúde', value: 'favorite' },
  { label: 'Lazer', value: 'celebration' },
  { label: 'Educação', value: 'school' },
  { label: 'Roupas', value: 'checkroom' },
  { label: 'Contas', value: 'receipt_long' },
  { label: 'Compras', value: 'shopping_cart' },
  { label: 'Pets', value: 'pets' },
  { label: 'Viagem', value: 'flight' },
  { label: 'Café', value: 'local_cafe' },
  { label: 'Presente', value: 'card_giftcard' },
  { label: 'Geral', value: 'category' },
];

const name = ref('');
const color = ref(palette[0]);
const icon = ref('category');
const saving = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    name.value = props.category?.name ?? '';
    color.value = props.category?.color ?? palette[0];
    icon.value = props.category?.icon ?? 'category';
  },
);

async function onSubmit() {
  saving.value = true;
  try {
    if (isEdit.value && props.category) {
      await store.update(props.category.id, {
        name: name.value.trim(),
        color: color.value,
        icon: icon.value,
      });
      $q.notify({ type: 'positive', message: 'Categoria atualizada.' });
    } else {
      await store.create({ name: name.value.trim(), color: color.value, icon: icon.value });
      $q.notify({ type: 'positive', message: 'Categoria criada.' });
    }
    emit('saved');
    show.value = false;
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.fp-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid transparent;
  transition: transform 0.1s;
}
.fp-swatch--active {
  border-color: #0f172a;
  transform: scale(1.1);
}
</style>
