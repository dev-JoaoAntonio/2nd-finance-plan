<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center fp-auth-bg q-pa-md">
        <div class="full-width" style="max-width: 460px">
          <div class="text-center q-mb-lg">
            <q-icon :name="brand.logoIcon" size="64px" color="primary" />
            <div class="fp-page-title q-mt-sm">{{ brand.appName }}</div>
            <div class="fp-muted q-mt-xs" style="font-size: 1.05rem">
              {{ brand.copy.authTagline }}
            </div>
          </div>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { activeBrand as brand } from '@/brands';
</script>

<style scoped>
.fp-auth-bg {
  background: linear-gradient(
    160deg,
    var(--fp-auth-grad-from) 0%,
    var(--fp-auth-grad-to) 60%
  );
  min-height: 100vh;
}
</style>
