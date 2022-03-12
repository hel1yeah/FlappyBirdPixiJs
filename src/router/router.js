import Vue from 'vue'
import VueRouter from "vue-router";
import AppGame from "./../views/AppGame.vue";
import AppHome from "./../views/AppHome.vue";
import AppGameOver from "./../views/AppGameOver.vue"

Vue.use(VueRouter)
const routes = [
  {
    path: "/",
    name: "home",
    component: AppHome,
    meta: { transition: 'slide-left' },
  },
  {
    path: "/game",
    name: "game",
    component: AppGame,
    meta: { transition: 'slide-left' },
  },
  {
    path: "/gameover",
    name: "gameover",
    component: AppGameOver,
    meta: { transition: 'slide-left' },
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;
