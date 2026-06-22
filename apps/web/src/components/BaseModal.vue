<script setup lang="ts">
import { useSlots } from 'vue';
import Icon from './Icon.vue';

defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ close: [] }>();
const slots = useSlots();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div class="w-full max-w-md rounded-2xl border border-ink-200 bg-white shadow-pop">
          <div class="flex items-center justify-between border-b border-ink-200 px-5 py-4">
            <h3 class="text-base font-bold text-ink-900">{{ title }}</h3>
            <button
              class="grid h-8 w-8 place-content-center rounded-lg text-ink-400 hover:bg-slate-100"
              aria-label="Fechar"
              @click="emit('close')"
            >
              <Icon name="x" :size="18" />
            </button>
          </div>
          <div class="px-5 py-5">
            <slot />
          </div>
          <div
            v-if="slots.footer"
            class="flex justify-end gap-2 border-t border-ink-200 px-5 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
