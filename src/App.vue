<template>
  <div class="container">
    <!-- <canvas id="pixi"></canvas> -->
  </div>
</template>

<script>
import * as PIXI from 'pixi.js';
import imgUrl from './assets/img/bird.png';
export default {
  data() {
    return {};
  },

  created() {},
  mounted() {
    this.drawPixi();
  },
  methods: {
    drawPixi() {
      let container = document.querySelector('.container');
      const app = new PIXI.Application({
        transparent: true,
        width: 240,
        height: 400,
      });
      container.appendChild(app.view);

      const bird = PIXI.Sprite.from(imgUrl);

      app.stage.addChild(bird);

      app.ticker.add(() => {
        bird.x += 1;
        bird.width = 30;
        bird.height = 20;

        if (bird.x > 240) {
          bird.x = 0;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
