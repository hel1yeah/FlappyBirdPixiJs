import { createRouter, createWebHistory } from "vue-router";
import AppGame from "./../views/AppGame.vue";
import AppHome from "./../views/AppHome.vue";
import AppGameOver from "./../views/AppGameOver.vue"


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
    path: "/game-over",
    name: "game-over",
    component: AppGameOver,
    meta: { transition: 'slide-left' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
});

export default router;
