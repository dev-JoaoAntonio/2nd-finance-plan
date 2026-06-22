<script setup lang="ts" generic="T extends string | number">
defineProps<{
  modelValue: T;
  options: readonly { value: T; label: string }[];
}>();
defineEmits<{ 'update:modelValue': [T] }>();
</script>

<template>
  <div class="inline-flex rounded-lg border border-ink-200 bg-white p-0.5 shadow-soft">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      class="rounded-md px-3 py-1 text-xs font-semibold transition"
      :class="
        opt.value === modelValue
          ? 'bg-sky-600 text-white'
          : 'text-ink-500 hover:bg-slate-50'
      "
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
