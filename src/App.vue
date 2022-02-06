<template>
  <div class="container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script>

import AppGame from "./views/AppGame.vue";
import AppHome from "./views/AppHome.vue";

export default {
  name: 'app',
  components: {
    AppGame,
    AppHome
  },
  data() {
    return {

    }
  },
  computed: {
    gameStage() {
      return 'AppGame'
    }
  }
}
</script>

<style lang="scss" >
.fade-enter-active,
.fade-leave-active{
  opacity: 0;
  transition: 0.5s
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transition: 0.5s
  
}
</style>