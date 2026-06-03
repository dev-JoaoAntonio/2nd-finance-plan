<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center fp-auth-bg q-pa-md">
        <div class="full-width" style="max-width: 460px">
          <div class="text-center q-mb-lg">
            <q-icon name="savings" size="64px" color="primary" />
            <div class="fp-page-title q-mt-sm">Meu Planejador Financeiro</div>
            <div class="fp-muted q-mt-xs" style="font-size: 1.05rem">
              Acompanhe seus gastos com tranquilidade.
            </div>
          </div>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

<style scoped>
.fp-auth-bg {
  background: linear-gradient(160deg, #e0f2fe 0%, #f1f5f9 60%);
  min-height: 100vh;
}
</style>
