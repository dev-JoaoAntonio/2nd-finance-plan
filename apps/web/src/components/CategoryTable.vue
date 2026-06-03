<template>
  <!-- Tabela de fallback acessível (acompanha sempre o gráfico de rosca). -->
  <q-markup-table flat bordered class="fp-card" separator="horizontal">
    <thead>
      <tr>
        <th class="text-left">Categoria</th>
        <th class="text-right">Valor</th>
        <th class="text-right">% do mês</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in data" :key="row.categoryId ?? 'none'">
        <td class="text-left">
          <div class="row items-center no-wrap">
            <span
              class="fp-dot"
              :style="{ background: row.color }"
              aria-hidden="true"
            />
            <q-icon :name="row.icon" size="20px" class="q-mr-xs" :style="{ color: row.color }" />
            <span class="text-weight-medium">{{ row.name }}</span>
          </div>
        </td>
        <td class="text-right fp-amount">{{ formatCurrency(row.total) }}</td>
        <td class="text-right">{{ row.pct.toLocaleString('pt-BR') }}%</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="text-weight-bold">
        <td class="text-left">Total</td>
        <td class="text-right fp-amount">{{ formatCurrency(total) }}</td>
        <td class="text-right">100%</td>
      </tr>
    </tfoot>
  </q-markup-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { formatCurrency } from '@/lib/format';
import type { CategoryBreakdown } from '@/lib/types';

const props = defineProps<{ data: CategoryBreakdown[] }>();
const total = computed(() => props.data.reduce((acc, d) => acc + d.total, 0));
</script>

<style scoped>
.fp-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>
