import { createRouter, createWebHistory } from "vue-router";
import AppGame from "./../views/AppGame.vue";
import AppHome from "./../views/AppHome.vue";


const routes = [
  {
    path: "/",
    name: "home",
    component: AppHome,
  },
  {
    path: "/game",
    name: "game",
    component: AppGame,
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
