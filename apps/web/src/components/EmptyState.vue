<template>
  <div class="column flex-center text-center q-pa-xl fp-muted">
    <q-icon :name="icon" size="64px" color="grey-5" />
    <div class="q-mt-md text-weight-bold" style="font-size: 1.15rem; color: #334155">
      {{ title }}
    </div>
    <div v-if="message" class="q-mt-xs" style="max-width: 360px">{{ message }}</div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title: string;
  message?: string;
}>();
</script>
