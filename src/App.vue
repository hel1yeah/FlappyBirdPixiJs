<template>
  <div class="container">
    <div class="wrapper"></div>
  </div>
</template>

<script>
import { Container } from '@pixi/display';
import * as PIXI from 'pixi.js';
import birdUrl from './assets/img/bird.png';
import bgUrl from './assets/img/bg1.png';
import charBirdImg1 from './assets/img/drags/fly-bird1.png';
import charBirdImg2 from './assets/img/drags/fly-bird2.png';
import charBirdImg3 from './assets/img/drags/fly-bird3.png';
import charBirdImg4 from './assets/img/drags/fly-bird4.png';
// import charBirdJson from './assets/spritesheet/spritesheet.json';

export default {
  data() {
    return {
      app: null,
      bird: null,
      bgTexture: null,
      tilingSprite: null,
      alienImages: [charBirdImg1, charBirdImg2, charBirdImg3, charBirdImg4],
      textureArray: [],
      animatedSpray: null,
    };
  },

  created() {},
  mounted() {
    this.drawPixi();
  },
  methods: {
    drawPixi() {
      let wrapper = document.querySelector('.wrapper');
      let container = new Container();
      this.app = new PIXI.Application({
        transparent: true,
        width: 225,
        height: 400,
        interactive: true,
        buttonMode: true,
      });

      wrapper.appendChild(this.app.view);

      this.renderSourse();
      this.stageAdd();

      for (let i = 0; i < this.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.alienImages[i]);
        this.textureArray.push(texture);
      }

      this.animatedSpray = new PIXI.AnimatedSprite(this.textureArray);
      this.animatedSpray.position.set(30, 220);
      this.app.stage.addChild(this.animatedSpray);
      this.animatedSpray.play();
      this.animatedSpray.animationSpeed = 0.1;

      this.app.ticker.add(() => {
        this.moveBg();
        this.moveBird();
      });
    },
    renderSourse() {
      this.bgTexture = PIXI.Texture.from(bgUrl);
      this.tilingSprite = new PIXI.TilingSprite(this.bgTexture, 225, 400);
    },
    stageAdd() {
      this.app.stage.addChild(this.tilingSprite);
    },
    moveBird() {},
    moveBg() {
      this.tilingSprite.tilePosition.x -= 1;
    },
  },
};
</script>

<style lang="scss" scoped></style>
