<template>
  <div class="row items-center no-wrap q-gutter-sm">
    <q-btn
      round
      flat
      icon="chevron_left"
      aria-label="Mês anterior"
      size="md"
      @click="shift(-1)"
    />
    <q-btn
      no-caps
      outline
      color="primary"
      icon="event"
      class="text-weight-bold"
      style="min-width: 190px"
      :label="label"
    >
      <q-menu>
        <q-date
          :model-value="qdate"
          minimal
          default-view="Months"
          emit-immediately
          mask="YYYY/MM"
          @update:model-value="onPick"
        />
      </q-menu>
    </q-btn>
    <q-btn
      round
      flat
      icon="chevron_right"
      aria-label="Próximo mês"
      size="md"
      :disable="isCurrentOrFuture"
      @click="shift(1)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatMonthLabel, currentMonthKey } from '@/lib/format';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();

const label = computed(() => formatMonthLabel(props.modelValue));
const qdate = computed(() => props.modelValue.replace('-', '/'));

const isCurrentOrFuture = computed(() => props.modelValue >= currentMonthKey());

function shift(delta: number) {
  const [y, m] = props.modelValue.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  const next = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  if (delta > 0 && next > currentMonthKey()) return;
  emit('update:modelValue', next);
}

function onPick(val: string | null) {
  if (!val) return;
  // val no formato "YYYY/MM"
  const key = val.replace('/', '-').slice(0, 7);
  if (key > currentMonthKey()) return;
  emit('update:modelValue', key);
}
</script>
