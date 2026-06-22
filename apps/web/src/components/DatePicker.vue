<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | null;
    min?: string;
    max?: string;
    placeholder?: string;
    disabled?: boolean;
    allowClear?: boolean;
  }>(),
  { placeholder: 'dd/mm/aaaa', allowClear: true },
);
const emit = defineEmits<{
  'update:modelValue': [string | null];
  change: [string | null];
}>();

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const WEEK = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const open = ref(false);
const view = ref<'days' | 'months' | 'years'>('days');
const root = ref<HTMLElement | null>(null);

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parse(key: string | null) {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  return { y, m: m - 1, d };
}

const viewYear = ref(new Date().getFullYear());
const viewMonth = ref(new Date().getMonth());

watch(
  () => props.modelValue,
  (v) => {
    const p = parse(v);
    if (p) {
      viewYear.value = p.y;
      viewMonth.value = p.m;
    }
  },
  { immediate: true },
);

const display = computed(() => {
  const p = parse(props.modelValue);
  if (!p) return '';
  return `${String(p.d).padStart(2, '0')}/${String(p.m + 1).padStart(2, '0')}/${p.y}`;
});

const grid = computed(() => {
  const firstDow = new Date(viewYear.value, viewMonth.value, 1).getDay();
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
  const cells: ({ key: string; day: number } | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ key, day: d });
  }
  return cells;
});

const years = computed(() => {
  const start = Math.floor(viewYear.value / 12) * 12;
  return Array.from({ length: 12 }, (_, i) => start + i);
});

function disabledKey(key: string) {
  if (props.min && key < props.min) return true;
  if (props.max && key > props.max) return true;
  return false;
}

function pick(key: string) {
  if (disabledKey(key)) return;
  emit('update:modelValue', key);
  emit('change', key);
  open.value = false;
}
function clear() {
  emit('update:modelValue', null);
  emit('change', null);
  open.value = false;
}
function goToday() {
  const t = todayKey();
  const p = parse(t)!;
  viewYear.value = p.y;
  viewMonth.value = p.m;
  pick(t);
}
function shiftMonth(n: number) {
  const d = new Date(viewYear.value, viewMonth.value + n, 1);
  viewYear.value = d.getFullYear();
  viewMonth.value = d.getMonth();
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
      class="input flex items-center justify-between text-left"
      :disabled="disabled"
      @click="open = !open"
    >
      <span :class="display ? 'text-ink-800' : 'text-ink-400'">{{ display || placeholder }}</span>
      <span class="material-symbols-rounded text-sky-600" style="font-size: 18px">calendar_month</span>
    </button>

    <Transition name="dp">
      <div
        v-if="open"
        class="absolute z-40 mt-1 w-[18rem] rounded-2xl border border-ink-200 bg-white p-3 shadow-pop"
      >
        <!-- header -->
        <div class="mb-2 flex items-center justify-between">
          <button class="grid h-8 w-8 place-content-center rounded-lg text-ink-500 hover:bg-slate-100" @click="view === 'years' ? (viewYear -= 12) : shiftMonth(-1)">
            <span class="material-symbols-rounded" style="font-size: 18px">chevron_left</span>
          </button>
          <button
            class="rounded-lg px-3 py-1 text-sm font-bold text-ink-800 hover:bg-slate-100"
            @click="view = view === 'days' ? 'months' : view === 'months' ? 'years' : 'days'"
          >
            <template v-if="view === 'days'">{{ MONTHS[viewMonth] }} {{ viewYear }}</template>
            <template v-else-if="view === 'months'">{{ viewYear }}</template>
            <template v-else>{{ years[0] }} – {{ years[11] }}</template>
          </button>
          <button class="grid h-8 w-8 place-content-center rounded-lg text-ink-500 hover:bg-slate-100" @click="view === 'years' ? (viewYear += 12) : shiftMonth(1)">
            <span class="material-symbols-rounded" style="font-size: 18px">chevron_right</span>
          </button>
        </div>

        <!-- days -->
        <div v-if="view === 'days'">
          <div class="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold text-ink-400">
            <span v-for="(w, i) in WEEK" :key="i">{{ w }}</span>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <template v-for="(c, i) in grid" :key="i">
              <span v-if="!c" />
              <button
                v-else
                type="button"
                class="grid h-9 place-content-center rounded-lg text-sm transition"
                :class="[
                  c.key === modelValue ? 'bg-sky-500 font-bold text-white' : 'text-ink-700 hover:bg-slate-100',
                  c.key === todayKey() && c.key !== modelValue ? 'ring-1 ring-sky-400' : '',
                  disabledKey(c.key) ? 'cursor-not-allowed opacity-30' : '',
                ]"
                :disabled="disabledKey(c.key)"
                @click="pick(c.key)"
              >
                {{ c.day }}
              </button>
            </template>
          </div>
        </div>

        <!-- months -->
        <div v-else-if="view === 'months'" class="grid grid-cols-3 gap-2">
          <button
            v-for="(m, i) in MONTHS"
            :key="i"
            type="button"
            class="rounded-lg py-2 text-sm hover:bg-slate-100"
            :class="i === viewMonth ? 'bg-sky-50 font-semibold text-sky-700' : 'text-ink-700'"
            @click="((viewMonth = i), (view = 'days'))"
          >
            {{ m.slice(0, 3) }}
          </button>
        </div>

        <!-- years -->
        <div v-else class="grid grid-cols-3 gap-2">
          <button
            v-for="y in years"
            :key="y"
            type="button"
            class="rounded-lg py-2 text-sm hover:bg-slate-100"
            :class="y === viewYear ? 'bg-sky-50 font-semibold text-sky-700' : 'text-ink-700'"
            @click="((viewYear = y), (view = 'months'))"
          >
            {{ y }}
          </button>
        </div>

        <div class="mt-2 flex justify-between border-t border-ink-200 pt-2 text-xs font-semibold">
          <button class="text-sky-600 hover:underline" @click="goToday">Hoje</button>
          <button v-if="allowClear" class="text-ink-400 hover:underline" @click="clear">Limpar</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dp-enter-active,
.dp-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dp-enter-from,
.dp-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
