<template>
  <div class="home" ref="canvas"></div>
</template>

<script>
import { markRaw } from 'vue';
import * as PIXI from 'pixi.js';
import groundURL from '@/assets/img/ground.png';
import buttonStartURL from '@/assets/img/start.png';
import flappyLogo from '@/assets/img/flappy.png';
import birdLogo from '@/assets/img/bird-l.png';
import pointer from '@/assets/img/pointer.png';
import charBirdImg1 from '@/assets/img/drags/fly-bird1.png';
import charBirdImg2 from '@/assets/img/drags/fly-bird2.png';
import charBirdImg3 from '@/assets/img/drags/fly-bird3.png';

import { initPixiApp, createSprite, createTilingSprite, createAnimatedSprite, destroyApp } from '@/utils/pixi';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_WIDTH, GROUND_HEIGHT } from '@/utils/constants';

const BIRD_IMAGES = [charBirdImg1, charBirdImg2, charBirdImg3];
const ALL_ASSETS = [groundURL, buttonStartURL, flappyLogo, birdLogo, ...BIRD_IMAGES];
const GROUND_Y = 350;

export default {
  name: 'AppHome',
  data() {
    return {
      app: null,
      logoContainer: { container: null, y: 150 },
      ground: { sprite: null },
      buttonStart: { sprite: null },
      bird: { animatedSpray: null },
      factor: 1,
    };
  },
  async mounted() {
    await this.drawPixi();
    this.addListeners();
  },
  beforeUnmount() {
    this.removeListeners();
    destroyApp(this.app);
  },
  methods: {
    startGame() {
      this.$router.push({ name: 'game' });
    },

    async drawPixi() {
      this.app = await initPixiApp(this.$refs.canvas, GAME_WIDTH, GAME_HEIGHT);

      await PIXI.Assets.load(ALL_ASSETS);

      // Logo container (floats up/down)
      const container = markRaw(new PIXI.Container());
      container.position.set(20, 150);
      this.logoContainer.container = container;
      this.app.stage.addChild(container);

      // Logos
      const flappy = createSprite(flappyLogo);
      flappy.sprite.position.set(0, 0);
      container.addChild(flappy.sprite);

      const birdL = createSprite(birdLogo);
      birdL.sprite.position.set(87, 0);
      container.addChild(birdL.sprite);

      // Animated bird
      const { sprite: birdSprite } = createAnimatedSprite(BIRD_IMAGES);
      birdSprite.animationSpeed = 0.05;
      birdSprite.position.set(158, (container.height - birdSprite.height) / 2 - 4);
      birdSprite.play();
      this.bird.animatedSpray = birdSprite;
      container.addChild(birdSprite);

      // Ground
      const ground = createTilingSprite(groundURL, GROUND_WIDTH, GROUND_HEIGHT);
      ground.sprite.position.set(0, GROUND_Y);
      this.ground.sprite = ground.sprite;
      this.app.stage.addChild(ground.sprite);

      // Start button
      const btn = createSprite(buttonStartURL);
      btn.sprite.position.set(80, 270);
      btn.sprite.eventMode = 'static';
      btn.sprite.cursor = `url(${pointer}),auto`;
      btn.sprite.on('click', () => this.startGame());
      this.buttonStart.sprite = btn.sprite;
      this.app.stage.addChild(btn.sprite);

      this.app.ticker.add(() => {
        this.moveContainer();
        this.ground.sprite.tilePosition.x -= 1.1;
      });
    },

    moveContainer() {
      if (this.logoContainer.y >= 150) {
        this.factor = -1;
      } else if (this.logoContainer.y <= 140) {
        this.factor = 1;
      }
      this.logoContainer.y += 0.25 * this.factor;
      this.logoContainer.container.position.y = this.logoContainer.y;
    },

    onKeydown(e) {
      if (e.key === 'Enter') this.startGame();
    },

    onTouchend() {
      this.startGame();
    },

    addListeners() {
      window.addEventListener('keydown', this.onKeydown);
      window.addEventListener('touchend', this.onTouchend);
    },

    removeListeners() {
      window.removeEventListener('keydown', this.onKeydown);
      window.removeEventListener('touchend', this.onTouchend);
    },
  },
};
</script>

<style lang="scss" scoped>
.home {
  width: 225px;
  height: 400px;
  flex-grow: 1;
  background-image: url('./../assets/img/bg.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
