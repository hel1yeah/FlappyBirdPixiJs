<template>
  <div class="gameover-screen">
    <div class="game-over" ref="canvas"></div>
    <div v-if="scoreHistory.length" class="history">
      <div class="history__title">history</div>
      <div class="history__scroll">
        <div
          v-for="(entry, i) in scoreHistory"
          :key="i"
          :class="['history__row', { 'history__row--current': i === 0 && justFinished }]"
        >
          <span class="history__index">#{{ i + 1 }}</span>
          <span class="history__score">{{ entry.score }}</span>
          <span class="history__date">{{ entry.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import * as PIXI from 'pixi.js';
import groundURL from '@/assets/img/ground.png';
import buttonStartURL from '@/assets/img/start.png';
import gameOverImg from '@/assets/img/game-over.png';
import gshotBird from '@/assets/img/ghost-bird.png';
import pointer from '@/assets/img/pointer.png';

import { initPixiApp, createSprite, createTilingSprite, createText, destroyApp } from '@/utils/pixi';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_WIDTH, GROUND_HEIGHT } from '@/utils/constants';
import { mapState } from 'vuex';

const ALL_ASSETS = [groundURL, buttonStartURL, gameOverImg, gshotBird];
const GROUND_Y = 350;

const MEDAL_THRESHOLDS = [
  { min: 30, label: 'GOLD', color: 0xffd700 },
  { min: 20, label: 'SILVER', color: 0xc0c0c0 },
  { min: 10, label: 'BRONZE', color: 0xcd7f32 },
];

export default {
  name: 'AppGameOver',
  data() {
    return {
      app: null,
      logoContainer: { container: null, y: 130 },
      ground: { sprite: null },
      factor: 1,
      justFinished: true,
    };
  },
  computed: {
    ...mapState(['lastScore', 'isNewRecord', 'scoreHistory']),
    bestRecord() {
      return parseInt(localStorage.getItem('record') || '0', 10);
    },
    medal() {
      return MEDAL_THRESHOLDS.find(m => this.lastScore >= m.min) || null;
    },
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

      // Score panel
      const panel = markRaw(new PIXI.Container());
      panel.position.set(20, 5);

      const scoreLabel = createText(`score: ${this.lastScore}`, {
        fontFamily: 'BF', fontSize: 20, fontWeight: 'bold',
        fill: 0xffffff, stroke: { color: 0x000000, width: 4 },
      });
      scoreLabel.position.set(0, 0);
      panel.addChild(scoreLabel);

      const bestLabel = createText(`best: ${this.bestRecord}`, {
        fontFamily: 'BF', fontSize: 20, fontWeight: 'bold',
        fill: 0xffffff, stroke: { color: 0x000000, width: 4 },
      });
      bestLabel.position.set(0, 28);
      panel.addChild(bestLabel);

      if (this.isNewRecord && this.lastScore > 0) {
        const newText = createText('NEW!', {
          fontFamily: 'BF', fontSize: 14, fontWeight: 'bold',
          fill: 0xff3333, stroke: { color: 0x000000, width: 3 },
        });
        newText.position.set(130, 30);
        panel.addChild(newText);
      }

      if (this.medal) {
        const medalText = createText(this.medal.label, {
          fontFamily: 'BF', fontSize: 16, fontWeight: 'bold',
          fill: this.medal.color, stroke: { color: 0x000000, width: 3 },
        });
        medalText.position.set(0, 56);
        panel.addChild(medalText);
      }

      this.app.stage.addChild(panel);

      // Logo container
      const container = markRaw(new PIXI.Container());
      container.position.set(20, 130);
      this.logoContainer.container = container;
      this.app.stage.addChild(container);

      const gameOver = createSprite(gameOverImg);
      gameOver.sprite.position.set(0, 0);
      container.addChild(gameOver.sprite);

      const bird = createSprite(gshotBird);
      bird.sprite.position.set(158, 5);
      container.addChild(bird.sprite);

      // Ground
      const ground = createTilingSprite(groundURL, GROUND_WIDTH, GROUND_HEIGHT);
      ground.sprite.position.set(0, GROUND_Y);
      this.ground.sprite = ground.sprite;
      this.app.stage.addChild(ground.sprite);

      // Start button
      const btn = createSprite(buttonStartURL);
      btn.sprite.position.set(80, 280);
      btn.sprite.eventMode = 'static';
      btn.sprite.cursor = `url(${pointer}),auto`;
      btn.sprite.on('click', () => this.startGame());
      this.app.stage.addChild(btn.sprite);

      this.btnSprite = btn.sprite;
      this.pulseTime = 0;
      this.app.ticker.add((ticker) => {
        this.moveContainer();
        this.ground.sprite.tilePosition.x -= 1.1;
        this.pulseTime += ticker.deltaTime * 0.04;
        const s = 1 + Math.sin(this.pulseTime) * 0.05;
        this.btnSprite.scale.set(s, s);
      });
    },

    moveContainer() {
      if (this.logoContainer.y >= 135) {
        this.factor = -1;
      } else if (this.logoContainer.y <= 125) {
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
.gameover-screen {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.game-over {
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

.history {
  width: 225px;
  padding: 8px 0 4px;

  &__title {
    font-family: 'BF', sans-serif;
    font-size: 12px;
    font-weight: bold;
    color: #7a6249;
    text-align: center;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  &__scroll {
    max-height: 100px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    scrollbar-width: thin;
    scrollbar-color: #7a6249 transparent;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #7a6249;
      border-radius: 2px;
    }
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 4px;
    background: rgba(61, 43, 31, 0.6);
    font-family: 'BF', sans-serif;
    font-size: 11px;
    color: #a09080;
    flex-shrink: 0;

    &--current {
      background: rgba(212, 160, 86, 0.3);
      color: #f0c878;
    }
  }

  &__index {
    opacity: 0.5;
    min-width: 20px;
  }

  &__score {
    font-weight: bold;
    flex: 1;
  }

  &__date {
    opacity: 0.7;
  }
}
</style>
