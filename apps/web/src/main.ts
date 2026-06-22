import { createApp } from 'vue';
import { Quasar, Notify, Dialog, Loading } from 'quasar';
import quasarLang from 'quasar/lang/pt-BR';
import VueApexCharts from 'vue3-apexcharts';
import { createPinia } from 'pinia';

// Fonte de máxima legibilidade (Atkinson Hyperlegible), self-hosted
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';

// Ícones + estilos do Quasar
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';

// Estilos do app (acessibilidade + tema)
import './css/app.scss';

import App from './App.vue';
import router from './router';
import { api } from './lib/api';
import { useAuthStore } from './stores/auth';
import { useUiStore } from './stores/ui';
import { activeBrand } from './brands';
import { applyBrand } from './brands/apply';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueApexCharts);
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading },
  lang: quasarLang,
  config: {
    notify: { position: 'top', timeout: 3500 },
  },
});

// Aplica a identidade visual da marca ativa (cores, tema, fonte, título).
applyBrand(activeBrand);

// Aplica a escala de fonte salva (acessibilidade) antes de montar.
useUiStore().init();

// Em qualquer 401 (token expirado/inválido), encerra a sessão e volta ao login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const auth = useAuthStore();
      if (auth.isAuthenticated) {
        auth.logout();
        void router.replace({ name: 'login' });
      }
    }
    return Promise.reject(error);
  },
);

app.mount('#app');
