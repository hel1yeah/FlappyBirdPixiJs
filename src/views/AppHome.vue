<template>
  <div class="home-screen">
    <div class="home" ref="canvas"></div>
    <div class="skins">
      <div class="skins__title">skins</div>
      <div class="skins__list">
        <button
          v-for="skin in allSkins"
          :key="skin.id"
          :class="['skins__item', {
            'skins__item--active': skin.id === selectedSkinId,
            'skins__item--locked': !unlockedIds.has(skin.id),
          }]"
          :style="{ backgroundColor: '#' + skin.tint.toString(16).padStart(6, '0') }"
          :disabled="!unlockedIds.has(skin.id)"
          :title="unlockedIds.has(skin.id) ? skin.name : `Unlock at ${skin.unlockAt} pts`"
          @click="chooseSkin(skin)"
        >
          <span v-if="!unlockedIds.has(skin.id)" class="skins__lock">🔒</span>
        </button>
      </div>
    </div>
  </div>
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
import { SKINS, getUnlockedSkins, getSelectedSkin, selectSkin } from '@/utils/skins';

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
      allSkins: SKINS,
      selectedSkinId: getSelectedSkin().id,
      unlockedIds: new Set(getUnlockedSkins().map(s => s.id)),
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

    chooseSkin(skin) {
      selectSkin(skin.id);
      this.selectedSkinId = skin.id;
      if (this.bird.animatedSpray) {
        this.bird.animatedSpray.tint = skin.tint;
      }
    },

    async drawPixi() {
      this.app = await initPixiApp(this.$refs.canvas, GAME_WIDTH, GAME_HEIGHT);

      await PIXI.Assets.load(ALL_ASSETS);

      // Logo container
      const container = markRaw(new PIXI.Container());
      container.position.set(20, 150);
      this.logoContainer.container = container;
      this.app.stage.addChild(container);

      const flappy = createSprite(flappyLogo);
      flappy.sprite.position.set(0, 0);
      container.addChild(flappy.sprite);

      const birdL = createSprite(birdLogo);
      birdL.sprite.position.set(87, 0);
      container.addChild(birdL.sprite);

      // Animated bird with skin
      const { sprite: birdSprite } = createAnimatedSprite(BIRD_IMAGES);
      birdSprite.animationSpeed = 0.05;
      birdSprite.position.set(158, (container.height - birdSprite.height) / 2 - 4);
      birdSprite.tint = getSelectedSkin().tint;
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

      this.pulseTime = 0;
      this.app.ticker.add((ticker) => {
        this.moveContainer();
        this.ground.sprite.tilePosition.x -= 1.1;
        this.pulseTime += ticker.deltaTime * 0.04;
        const s = 1 + Math.sin(this.pulseTime) * 0.05;
        this.buttonStart.sprite.scale.set(s, s);
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
.home-screen {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.home {
  width: 225px;
  height: 400px;
  background-image: url('./../assets/img/bg.png');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.skins {
  width: 225px;
  padding: 8px 0 4px;

  &__title {
    font-family: 'BF', sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #7a6249;
    text-align: center;
    margin-bottom: 6px;
    text-transform: uppercase;
  }

  &__list {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  &__item {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #7a6249;
    cursor: pointer;
    position: relative;
    transition: all 0.15s ease;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &--active {
      border-color: #f0c878;
      box-shadow: 0 0 8px rgba(240, 200, 120, 0.6);
      transform: scale(1.15);
    }

    &--locked {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(&--locked) {
      transform: scale(1.1);
    }
  }

  &__lock {
    font-size: 10px;
  }
}
</style>
