<template>
  <q-page class="q-pa-md q-pa-lg-lg">
    <div class="row items-center justify-between q-mb-md q-gutter-y-md">
      <div>
        <div class="fp-page-title">Categorias</div>
        <div class="fp-muted" style="font-size: 1.05rem">
          As palavras-chave ajudam a classificar seus gastos automaticamente.
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        size="lg"
        icon="add"
        label="Nova categoria"
        @click="openCreate"
      />
    </div>

    <q-banner
      class="text-primary rounded-borders q-mb-md"
      style="background-color: var(--fp-nav-active-bg)"
      dense
    >
      <template #avatar><q-icon name="lightbulb" color="primary" /></template>
      Ex.: a palavra <b>"farmácia"</b> na categoria <b>Saúde</b> faz um gasto descrito como
      "Compra na farmácia" entrar em Saúde sozinho.
    </q-banner>

    <q-inner-loading :showing="store.loading && !store.items.length" color="primary" />

    <q-list v-if="store.items.length" class="q-gutter-y-sm">
      <q-expansion-item
        v-for="cat in store.items"
        :key="cat.id"
        class="fp-card overflow-hidden"
        header-class="q-py-sm"
      >
        <template #header>
          <q-item-section avatar>
            <q-avatar :style="{ background: `${cat.color}1A` }" size="44px">
              <q-icon :name="cat.icon" :style="{ color: cat.color }" size="24px" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold" style="font-size: 1.1rem">
              {{ cat.name }}
            </q-item-label>
            <q-item-label caption>
              {{ cat._count?.expenses ?? 0 }} gasto(s) • {{ cat.rules?.length ?? 0 }} palavra(s)-chave
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row no-wrap">
              <q-btn
                flat round dense icon="edit" color="primary" size="md"
                aria-label="Editar categoria"
                @click.stop="openEdit(cat)"
              />
              <q-btn
                flat round dense icon="delete" color="negative" size="md"
                aria-label="Excluir categoria"
                @click.stop="confirmDelete(cat)"
              />
            </div>
          </q-item-section>
        </template>

        <q-card>
          <q-card-section>
            <div class="fp-muted q-mb-sm">Palavras-chave</div>
            <div class="row items-center q-gutter-sm q-mb-md">
              <q-chip
                v-for="rule in cat.rules"
                :key="rule.id"
                removable
                :style="{ backgroundColor: `${cat.color}22`, color: '#0f172a' }"
                @remove="removeRule(rule.id)"
              >
                {{ rule.keyword }}
              </q-chip>
              <span v-if="!cat.rules?.length" class="fp-muted">
                Nenhuma palavra-chave ainda.
              </span>
            </div>
            <q-form class="row items-start q-gutter-sm" @submit.prevent="addRule(cat)">
              <q-input
                v-model="newKeyword[cat.id]"
                dense
                outlined
                label="Nova palavra-chave"
                style="min-width: 240px"
                :rules="[(v) => !v || v.trim().length >= 2 || 'Mínimo 2 letras']"
              />
              <q-btn type="submit" color="primary" icon="add" label="Adicionar" unelevated />
            </q-form>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>

    <category-form-dialog v-model="showForm" :category="editing" @saved="store.fetchAll(true)" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useCategoriesStore } from '@/stores/categories';
import { apiErrorMessage } from '@/lib/api';
import CategoryFormDialog from '@/components/CategoryFormDialog.vue';
import type { Category } from '@/lib/types';

const $q = useQuasar();
const store = useCategoriesStore();

const showForm = ref(false);
const editing = ref<Category | null>(null);
const newKeyword = reactive<Record<string, string>>({});

function openCreate() {
  editing.value = null;
  showForm.value = true;
}
function openEdit(cat: Category) {
  editing.value = cat;
  showForm.value = true;
}

async function addRule(cat: Category) {
  const kw = (newKeyword[cat.id] ?? '').trim();
  if (kw.length < 2) return;
  try {
    await store.addRule(cat.id, kw);
    newKeyword[cat.id] = '';
    $q.notify({ type: 'positive', message: 'Palavra-chave adicionada.' });
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  }
}

async function removeRule(ruleId: string) {
  try {
    await store.removeRule(ruleId);
  } catch (e) {
    $q.notify({ type: 'negative', message: apiErrorMessage(e) });
  }
}

function confirmDelete(cat: Category) {
  $q.dialog({
    title: 'Excluir categoria',
    message: `Excluir "${cat.name}"? Os gastos ligados a ela ficarão sem categoria.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await store.remove(cat.id);
      $q.notify({ type: 'positive', message: 'Categoria excluída.' });
    } catch (e) {
      $q.notify({ type: 'negative', message: apiErrorMessage(e) });
    }
  });
}

onMounted(() => {
  void store.fetchAll(true);
});
</script>
