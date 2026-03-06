<template>
  <div class="container">
    <a href="https://hel1yeah.github.io/"></a>
    <router-view v-slot="{ Component }">
      <transition name="zoom" mode="out-in">
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

<style lang="scss">
.zoom-enter-active {
  animation: zoom-in 0.3s ease-out;
}
.zoom-leave-active {
  animation: zoom-out 0.2s ease-in;
}
@keyframes zoom-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes zoom-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.05);
  }
}
</style>
