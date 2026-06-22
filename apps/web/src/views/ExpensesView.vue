<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '@/stores/finance';
import { useToastStore } from '@/stores/toast';
import { formatCurrency, parseInput } from '@/utils/format';
import ExpenseRow from '@/components/ExpenseRow.vue';
import TransactionRow from '@/components/TransactionRow.vue';
import ExpenseModal from '@/components/ExpenseModal.vue';
import TransactionModal from '@/components/TransactionModal.vue';
import ConfirmModal from '@/components/ConfirmModal.vue';
import Icon from '@/components/Icon.vue';
import type { ComputedExpense, IncomeSource, Transaction } from '@/types';

const finance = useFinanceStore();
const toast = useToastStore();
const {
  computedExpenses,
  transactions,
  categories,
  incomeSources,
  income,
  fixedPlanned,
  transactionsTotal,
  currentMonth,
} = storeToRefs(finance);

// ── Fontes de renda ───────────────────────────────────────────────
const newSourceDesc = ref('');
const newSourceAmount = ref('');
const editingSourceId = ref<string | null>(null);
const editDesc = ref('');
const editAmount = ref('');

async function addSource() {
  const desc = newSourceDesc.value.trim();
  const amount = parseInput(newSourceAmount.value);
  if (!desc || amount <= 0) {
    toast.error('Informe descrição e valor da fonte.');
    return;
  }
  await finance.addIncomeSource(desc, amount);
  newSourceDesc.value = '';
  newSourceAmount.value = '';
  toast.success('Fonte adicionada.');
}
function startEdit(s: IncomeSource) {
  editingSourceId.value = s.id;
  editDesc.value = s.description;
  editAmount.value = s.amount.toFixed(2).replace('.', ',');
}
async function saveEdit(id: string) {
  await finance.updateIncomeSource(id, {
    description: editDesc.value.trim(),
    amount: parseInput(editAmount.value),
  });
  editingSourceId.value = null;
  toast.success('Fonte atualizada.');
}
async function removeSource(id: string) {
  await finance.deleteIncomeSource(id);
  toast.success('Fonte removida.');
}

// ── Passivos fixos & transações ───────────────────────────────────
const showExpense = ref(false);
const editingExpense = ref<ComputedExpense | null>(null);
const showTx = ref(false);
const editingTx = ref<Transaction | null>(null);
const saving = ref(false);
const confirm = ref<{ kind: 'expense' | 'transaction'; id: string } | null>(null);

const defaultTxDate = computed(() => {
  const now = new Date();
  const real = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  if (currentMonth.value === real) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  return currentMonth.value;
});

function openExpense(e: ComputedExpense | null) {
  editingExpense.value = e;
  showExpense.value = true;
}
async function saveExpense(payload: { title: string; description: string | null; amount: number }) {
  saving.value = true;
  try {
    if (editingExpense.value) {
      await finance.updateExpense(editingExpense.value.id, payload);
      toast.success('Passivo atualizado.');
    } else {
      await finance.createExpense(payload);
      toast.success('Passivo adicionado.');
    }
    showExpense.value = false;
  } finally {
    saving.value = false;
  }
}

function openTx(t: Transaction | null) {
  editingTx.value = t;
  showTx.value = true;
}
async function saveTx(payload: {
  amount: number;
  categoryId: string;
  occurredAt: string;
  description: string | null;
}) {
  saving.value = true;
  try {
    if (editingTx.value) {
      await finance.updateTransaction(editingTx.value.id, payload);
      toast.success('Transação atualizada.');
    } else {
      await finance.createTransaction(payload);
      toast.success('Transação registrada.');
    }
    showTx.value = false;
  } finally {
    saving.value = false;
  }
}

async function doConfirm() {
  if (!confirm.value) return;
  saving.value = true;
  try {
    if (confirm.value.kind === 'expense') await finance.deleteExpense(confirm.value.id);
    else await finance.deleteTransaction(confirm.value.id);
    toast.success('Removido.');
    confirm.value = null;
  } finally {
    saving.value = false;
  }
}

async function updateSpent(id: string, value: number) {
  await finance.updateSpent(id, value);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Auditoria de fontes -->
    <div class="card overflow-hidden" v-reveal>
      <div class="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-sky-600 px-5 py-4 text-white">
        <div class="grid h-10 w-10 place-content-center rounded-xl bg-white/20">
          <Icon name="wallet" :size="22" />
        </div>
        <div>
          <div class="text-[11px] font-semibold uppercase tracking-wider text-white/80">Receita do mês</div>
          <div class="text-lg font-bold">Auditoria de fontes</div>
        </div>
        <div class="ml-auto text-right">
          <div class="font-mono text-xl font-extrabold">{{ formatCurrency(income) }}</div>
          <div class="text-[11px] text-white/80">{{ incomeSources.length }} fonte(s)</div>
        </div>
      </div>

      <div class="space-y-2 p-5">
        <div
          v-for="s in incomeSources"
          :key="s.id"
          class="group flex items-center gap-3 rounded-xl border border-ink-200 px-3 py-2.5"
        >
          <Icon name="wallet" :size="18" class="text-emerald-600" />
          <template v-if="editingSourceId === s.id">
            <input v-model="editDesc" class="input flex-1" />
            <input v-model="editAmount" class="input w-28 font-mono" inputmode="decimal" />
            <button class="btn-primary !py-1.5" @click="saveEdit(s.id)">Salvar</button>
            <button class="btn-ghost !py-1.5" @click="editingSourceId = null">Cancelar</button>
          </template>
          <template v-else>
            <button class="flex-1 truncate text-left text-sm font-medium text-ink-800 hover:text-sky-700" @click="startEdit(s)">
              {{ s.description }}
            </button>
            <span class="font-mono text-sm font-bold text-emerald-700">{{ formatCurrency(s.amount) }}</span>
            <div class="flex gap-1 opacity-0 transition group-hover:opacity-100">
              <button class="grid h-8 w-8 place-content-center rounded-lg text-sky-600 hover:bg-sky-50" @click="startEdit(s)">
                <Icon name="edit" :size="16" />
              </button>
              <button class="grid h-8 w-8 place-content-center rounded-lg text-rose-600 hover:bg-rose-50" @click="removeSource(s.id)">
                <Icon name="trash" :size="16" />
              </button>
            </div>
          </template>
        </div>

        <div class="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-emerald-300 p-3">
          <div class="flex-1">
            <label class="label">Nova fonte</label>
            <input v-model="newSourceDesc" class="input" placeholder="Ex.: Salário, Freelance, 13º..." />
          </div>
          <div class="w-32">
            <label class="label">Valor</label>
            <input
              v-model="newSourceAmount"
              class="input font-mono"
              inputmode="decimal"
              placeholder="0,00"
              @keyup.enter="addSource"
            />
          </div>
          <button class="income-add" @click="addSource">
            <Icon name="plus" :size="18" /> Adicionar
          </button>
        </div>
      </div>
    </div>

    <!-- Passivos fixos + transações -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Fixos -->
      <div class="card flex flex-col" v-reveal>
        <div class="flex items-center gap-3 border-b border-ink-200 px-5 py-4">
          <div class="grid h-9 w-9 place-content-center rounded-xl bg-pink-100 text-pink-600">
            <Icon name="home" :size="20" />
          </div>
          <h3 class="font-bold text-ink-900">Passivos Fixos</h3>
          <button class="btn-primary ml-auto !py-1.5" @click="openExpense(null)">
            <Icon name="plus" :size="16" /> Inserir
          </button>
        </div>
        <div class="space-y-2 overflow-y-auto p-4" style="max-height: 480px">
          <ExpenseRow
            v-for="e in computedExpenses"
            :key="e.id"
            :expense="e"
            @update-spent="updateSpent"
            @edit="openExpense"
            @delete="(ex) => (confirm = { kind: 'expense', id: ex.id })"
          />
          <p v-if="!computedExpenses.length" class="py-8 text-center text-sm text-ink-400">
            Nenhum passivo fixo neste mês.
          </p>
        </div>
        <div class="flex items-center justify-between border-t border-ink-200 px-5 py-3">
          <span class="text-sm font-semibold text-ink-500">Total</span>
          <span class="font-mono font-bold text-ink-900">{{ formatCurrency(fixedPlanned) }}</span>
        </div>
      </div>

      <!-- Transações -->
      <div class="card flex flex-col" v-reveal="{ delay: 80 }">
        <div class="flex items-center gap-3 border-b border-ink-200 px-5 py-4">
          <div class="grid h-9 w-9 place-content-center rounded-xl bg-sky-100 text-sky-600">
            <Icon name="cart" :size="20" />
          </div>
          <h3 class="font-bold text-ink-900">Transações do mês</h3>
          <button class="btn-primary ml-auto !py-1.5" @click="openTx(null)">
            <Icon name="plus" :size="16" /> Registrar
          </button>
        </div>
        <div class="space-y-2 overflow-y-auto p-4" style="max-height: 480px">
          <TransactionRow
            v-for="t in transactions"
            :key="t.id"
            :transaction="t"
            @edit="openTx"
            @delete="(tx) => (confirm = { kind: 'transaction', id: tx.id })"
          />
          <p v-if="!transactions.length" class="py-8 text-center text-sm text-ink-400">
            Nenhuma transação neste mês.
          </p>
        </div>
        <div class="flex items-center justify-between border-t border-ink-200 px-5 py-3">
          <span class="text-sm font-semibold text-ink-500">Total</span>
          <span class="font-mono font-bold text-ink-900">{{ formatCurrency(transactionsTotal) }}</span>
        </div>
      </div>
    </div>

    <ExpenseModal
      :open="showExpense"
      type="fixed"
      :expense="editingExpense"
      :loading="saving"
      @close="showExpense = false"
      @save="saveExpense"
    />
    <TransactionModal
      :open="showTx"
      :transaction="editingTx"
      :categories="categories"
      :default-date="defaultTxDate"
      :loading="saving"
      @close="showTx = false"
      @save="saveTx"
    />
    <ConfirmModal
      :open="!!confirm"
      title="Remover item?"
      :loading="saving"
      @close="confirm = null"
      @confirm="doConfirm"
    />
  </div>
</template>

<style scoped>
.income-add {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #10b981 0%, #3e6b4f 140%);
  box-shadow: 0 8px 20px -10px rgba(16, 185, 129, 0.7);
  transition: filter 0.15s ease;
}
.income-add:hover {
  filter: brightness(0.95);
}
</style>
