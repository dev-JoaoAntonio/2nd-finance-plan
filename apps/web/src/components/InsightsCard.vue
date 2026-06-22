<script setup lang="ts">
import Icon from './Icon.vue';

defineProps<{ insights: { kind: 'good' | 'warn' | 'info'; text: string }[] }>();

const ring: Record<string, string> = {
  good: 'ring-emerald-300 text-emerald-600',
  warn: 'ring-amber-300 text-amber-600',
  info: 'ring-sky-300 text-sky-600',
};
const icon: Record<string, string> = {
  good: 'check',
  warn: 'trending',
  info: 'tune',
};
</script>

<template>
  <div class="card h-full p-5">
    <div class="section-tag">
      <Icon name="tune" :size="14" class="text-pink-500" />
      Insights do mês
    </div>

    <ul v-if="insights.length" class="mt-3 space-y-3">
      <li v-for="(ins, i) in insights" :key="i" class="flex items-start gap-3">
        <span
          class="grid h-7 w-7 shrink-0 place-content-center rounded-full bg-white ring-2"
          :class="ring[ins.kind]"
        >
          <Icon :name="icon[ins.kind]" :size="15" />
        </span>
        <span class="text-sm text-ink-700">{{ ins.text }}</span>
      </li>
    </ul>

    <div v-else class="mt-8 text-center text-sm text-ink-400">
      Adicione gastos para ver insights automáticos.
    </div>
  </div>
</template>
