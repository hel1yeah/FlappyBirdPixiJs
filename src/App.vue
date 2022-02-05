<template>
  <div class="container">
    <router-view></router-view>
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

<style lang="scss" scoped>
</style>