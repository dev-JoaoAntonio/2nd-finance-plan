<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ value: number; color?: 'sky' | 'pink' }>(),
  { color: 'sky' },
);

const width = computed(() => `${Math.max(0, Math.min(100, props.value))}%`);
const fillClass = computed(() =>
  props.color === 'pink' ? 'bg-pink-500' : 'bg-sky-600',
);
</script>

<template>
  <div class="h-3 overflow-hidden rounded-full border border-line-strong bg-paper-warm">
    <div
      class="h-full transition-all duration-700"
      :class="fillClass"
      :style="{ width }"
    />
  </div>
</template>
