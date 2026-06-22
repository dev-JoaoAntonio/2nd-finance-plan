<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/toast';
import Icon from './Icon.vue';

const store = useToastStore();
const { toasts } = storeToRefs(store);

const styles: Record<string, string> = {
  success: 'border-sky-200 bg-sky-50 text-sky-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-ink-200 bg-white text-ink-700',
};
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[60] w-80 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-pop"
          :class="styles[t.type]"
        >
          <Icon :name="t.type === 'error' ? 'x' : 'check'" :size="18" class="mt-0.5" />
          <span class="flex-1">{{ t.message }}</span>
          <button
            class="opacity-60 hover:opacity-100"
            aria-label="Fechar"
            @click="store.remove(t.id)"
          >
            <Icon name="x" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.4, 0.64, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
