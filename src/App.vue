<template>
  <div class="container">
    <a href="https://hel1yeah.github.io/"></a>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <app-ticker-text />
  </div>
</template>

<script>

import AppTickerText from '@/components/AppTickerText.vue';

export default {
  name: 'app',
  components: {
    AppTickerText,
  },
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