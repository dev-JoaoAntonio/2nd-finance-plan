import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let counter = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function remove(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function push(type: ToastType, message: string, timeout = 3500) {
    const id = ++counter;
    toasts.value.push({ id, type, message });
    if (timeout > 0) setTimeout(() => remove(id), timeout);
  }

  const success = (m: string) => push('success', m);
  const error = (m: string) => push('error', m);
  const info = (m: string) => push('info', m);

  return { toasts, push, remove, success, error, info };
});
