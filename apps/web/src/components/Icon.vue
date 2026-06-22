<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 20,
});

const GLYPHS: Record<string, string> = {
  wallet: 'account_balance_wallet',
  dashboard: 'dashboard',
  list: 'list_alt',
  home: 'home',
  cart: 'shopping_cart',
  plane: 'flight',
  target: 'track_changes',
  barChart: 'bar_chart',
  plus: 'add',
  trash: 'delete',
  x: 'close',
  edit: 'edit',
  menu: 'menu',
  menuOpen: 'menu_open',
  logout: 'logout',
  chevronLeft: 'chevron_left',
  chevronRight: 'chevron_right',
  chevronDown: 'expand_more',
  chevronUp: 'expand_less',
  check: 'check',
  trending: 'trending_up',
  shield: 'shield',
  lock: 'lock',
  tune: 'tune',
  settings: 'settings',
};

const glyph = computed(() => GLYPHS[props.name] ?? props.name);
</script>

<template>
  <span
    class="material-symbols-rounded select-none align-middle leading-none"
    :style="{ fontSize: `${size}px` }"
    >{{ glyph }}</span
  >
</template>
