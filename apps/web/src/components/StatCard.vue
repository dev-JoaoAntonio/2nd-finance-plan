<template>
  <q-card flat bordered class="fp-card full-height">
    <q-card-section class="q-pb-sm">
      <div class="row items-center no-wrap">
        <q-avatar :style="{ background: tintBg }" size="46px" class="q-mr-md">
          <q-icon :name="icon" size="26px" :style="{ color: color }" />
        </q-avatar>
        <div class="fp-muted text-weight-medium" style="font-size: 1rem">
          {{ label }}
        </div>
      </div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <div class="fp-amount" style="font-size: 1.7rem; color: #0f172a">
        {{ value }}
      </div>
      <div v-if="hint" class="q-mt-xs row items-center" style="font-size: 0.95rem">
        <q-icon
          v-if="hintIcon"
          :name="hintIcon"
          :class="hintClass"
          size="20px"
          class="q-mr-xs"
        />
        <span :class="hintClass">{{ hint }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    icon: string;
    color?: string;
    hint?: string;
    hintIcon?: string;
    hintClass?: string;
  }>(),
  { color: '#0369A1' },
);

// Cor de fundo suave derivada da cor principal (hex + alpha).
const tintBg = computed(() => `${props.color}1A`);
</script>
