import Vue from 'vue'
import App from './App.vue'

import router from './router/router';
import store from './store/store';

import './../node_modules/normalize-scss/sass/_normalize.scss';
import './assets/scss/main.scss';

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
