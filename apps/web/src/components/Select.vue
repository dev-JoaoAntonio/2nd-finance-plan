<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Icon from './Icon.vue';

export interface SelectOption {
  value: string;
  label: string;
  color?: string | null;
}

const props = defineProps<{
  modelValue: string | null;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [string] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const selected = computed(() =>
  props.options.find((o) => o.value === props.modelValue),
);

function pick(o: SelectOption) {
  emit('update:modelValue', o.value);
  open.value = false;
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false;
}
onMounted(() => {
  document.addEventListener('mousedown', onDocClick);
  document.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick);
  document.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="input flex items-center justify-between"
      :disabled="disabled"
      @click="open = !open"
    >
      <span class="flex items-center gap-2 truncate">
        <span
          v-if="selected?.color"
          class="h-2.5 w-2.5 rounded-full"
          :style="{ background: selected.color }"
        />
        <span :class="selected ? 'text-ink-800' : 'text-ink-400'">
          {{ selected?.label ?? placeholder ?? 'Selecione' }}
        </span>
      </span>
      <Icon
        name="chevronDown"
        :size="18"
        class="text-ink-400 transition"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <Transition name="dd">
      <ul
        v-if="open"
        class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-ink-200 bg-white py-1 shadow-pop"
      >
        <li
          v-for="o in options"
          :key="o.value"
          class="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-slate-50"
          :class="o.value === modelValue ? 'bg-sky-50 text-sky-700' : 'text-ink-700'"
          @click="pick(o)"
        >
          <span class="flex items-center gap-2">
            <span
              v-if="o.color"
              class="h-2.5 w-2.5 rounded-full"
              :style="{ background: o.color }"
            />
            {{ o.label }}
          </span>
          <Icon v-if="o.value === modelValue" name="check" :size="16" />
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.dd-enter-active,
.dd-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dd-enter-from,
.dd-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
