<template>
  <div class="game-screen">
    <div class="wrapper" ref="canvas"></div>
    <div class="active-keys">
      <span :class="['key-badge', { active: pressedKey === 'arrowup' }]">↑</span>
      <span :class="['key-badge', 'key-badge--wide', { active: pressedKey === 'space' }]">SPACE</span>
      <span :class="['key-badge', { active: pressedKey === 'tap' }]">TAP</span>
    </div>
  </div>
</template>

<script>
import { markRaw } from 'vue';
import * as PIXI from 'pixi.js';
import bgUrl from '@/assets/img/bg.png';
import bg2Url from '@/assets/img/bg2.png';
import groundURL from '@/assets/img/ground.png';
import pipeBottomURL from '@/assets/img/pipe-bottom.png';
import pipeTopURL from '@/assets/img/pipe-top.png';
import clueTapURL from '@/assets/img/clue-tap.png';
import charBirdImg1 from '@/assets/img/drags/fly-bird1.png';
import charBirdImg2 from '@/assets/img/drags/fly-bird2.png';
import charBirdImg3 from '@/assets/img/drags/fly-bird3.png';

import { initPixiApp, createSprite, createTilingSprite, createText, createAnimatedSprite, destroyApp } from '@/utils/pixi';
import { rectsOverlap, getBirdBounds } from '@/utils/collision';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_Y, GROUND_WIDTH, GROUND_HEIGHT,
  PIPE_HEIGHT, PIPE_GAP, PIPE_MIN_Y, PIPE_MAX_Y, PIPE_SPACING, PIPE_COUNT,
  GRAVITY, JUMP_FORCE, PIPE_SPEED, BG_SPEED, GROUND_SPEED,
  SPEED_INCREMENT, GAP_DECREMENT, MIN_PIPE_GAP, DIFFICULTY_INTERVAL,
  DEATH_DURATION,
} from '@/utils/constants';

const BIRD_IMAGES = [charBirdImg1, charBirdImg2, charBirdImg3];
const ALL_ASSETS = [bgUrl, bg2Url, groundURL, pipeBottomURL, pipeTopURL, clueTapURL, ...BIRD_IMAGES];
const BG_CHANGE_INTERVAL = 10;

export default {
  name: 'AppGame',
  data() {
    return {
      gameStart: false,
      gameFinish: false,
      dying: false,
      deathTimer: 0,
      app: null,
      bird: { animatedSpray: null, x: 30, y: 150 },
      velocity: 0,
      idleTime: 0,
      idleBaseY: 150,
      pipes: [],
      ground: { sprite: null, x: 0 },
      clue: { sprite: null, x: 82, y: 200 },
      keyHints: { container: null },
      scoreText: { text: null, score: 0, y: 30 },
      scorePopScale: 1,
      bgSprite: null,
      bgTextures: { day: null, night: null },
      isNight: false,
      lastBgSwitch: 0,
      flashOverlay: null,
      flashAlpha: 0,
      currentPipeSpeed: PIPE_SPEED,
      currentPipeGap: PIPE_GAP,
      pressedKey: null,
      pressedKeyTimer: null,
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
    async drawPixi() {
      this.app = await initPixiApp(this.$refs.canvas, GAME_WIDTH, GAME_HEIGHT);

      this.app.stage.eventMode = 'static';
      this.app.stage.hitArea = this.app.screen;
      this.app.stage.on('click', () => {
        if (!this.gameFinish) {
          this.flashKey('tap');
          this.handleInput();
        }
      });

      await PIXI.Assets.load(ALL_ASSETS);

      this.createResources();
      this.addToStage();
      this.createKeyHints();

      this.app.ticker.add((ticker) => {
        const dt = ticker.deltaTime;

        // Flash overlay fade
        if (this.flashAlpha > 0) {
          this.flashAlpha = Math.max(0, this.flashAlpha - 0.08 * dt);
          this.flashOverlay.alpha = this.flashAlpha;
        }

        if (this.dying) {
          this.updateDeathAnimation(dt);
          return;
        }
        if (!this.gameFinish) {
          this.moveGround(dt);
          this.moveBg(dt);
          if (this.gameStart) {
            this.updateBirdPhysics(dt);
            this.updatePipes(dt);
            this.updateScorePop(dt);
            this.checkCollisions();
          } else {
            this.updateIdleAnimation(dt);
          }
        }
      });
    },

    createResources() {
      // Background textures
      this.bgTextures.day = markRaw(PIXI.Texture.from(bgUrl));
      this.bgTextures.night = markRaw(PIXI.Texture.from(bg2Url));

      const bg = createTilingSprite(bgUrl, GAME_WIDTH, GAME_HEIGHT);
      this.bgSprite = bg.sprite;

      // Pipes pool
      for (let i = 0; i < PIPE_COUNT; i++) {
        const bottom = createSprite(pipeBottomURL);
        const top = createSprite(pipeTopURL);
        const startX = GAME_WIDTH + 80 + i * PIPE_SPACING;
        const pipe = {
          spriteBottom: bottom.sprite,
          spriteTop: top.sprite,
          x: startX,
          By: this.randomHeight(),
          scored: false,
        };
        this.updatePipePositions(pipe);
        this.pipes.push(pipe);
      }

      // Ground
      const ground = createTilingSprite(groundURL, GROUND_WIDTH, GROUND_HEIGHT);
      this.ground.sprite = ground.sprite;
      this.ground.sprite.position.set(this.ground.x, GROUND_Y);

      // Clue
      const clue = createSprite(clueTapURL);
      this.clue.sprite = clue.sprite;
      this.clue.sprite.position.set(this.clue.x, this.clue.y);

      // Score text
      this.scoreText.text = createText('0', {
        fontFamily: 'BF',
        fontSize: 30,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 5 },
      });
      this.scoreText.text.position.set((GAME_WIDTH / 2) - 10, this.scoreText.y);
      this.scoreText.text.anchor.set(0.5, 0);

      // Bird
      const { sprite: birdSprite } = createAnimatedSprite(BIRD_IMAGES);
      this.bird.animatedSpray = birdSprite;
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.bird.animatedSpray.animationSpeed = 0.12;
      this.bird.animatedSpray.width = 27;
      this.bird.animatedSpray.height = 19;
      this.bird.animatedSpray.scale.set(1, 1);
      this.bird.animatedSpray.play();

      // Flash overlay (white rect, on top of everything)
      this.flashOverlay = markRaw(new PIXI.Graphics());
      this.flashOverlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.flashOverlay.fill({ color: 0xffffff });
      this.flashOverlay.alpha = 0;
    },

    addToStage() {
      const stage = this.app.stage;
      stage.addChild(this.bgSprite);
      this.pipes.forEach((pipe) => {
        stage.addChild(pipe.spriteBottom);
        stage.addChild(pipe.spriteTop);
      });
      stage.addChild(this.ground.sprite);
      stage.addChild(this.clue.sprite);
      stage.addChild(this.scoreText.text);
      stage.addChild(this.bird.animatedSpray);
      stage.addChild(this.flashOverlay);
    },

    updatePipePositions(pipe) {
      pipe.spriteBottom.position.set(pipe.x, pipe.By);
      pipe.spriteTop.position.set(pipe.x, pipe.By - PIPE_HEIGHT - this.currentPipeGap);
    },

    // Idle: bird bobs up and down before game starts
    updateIdleAnimation(dt) {
      this.idleTime += dt * 0.05;
      this.bird.y = this.idleBaseY + Math.sin(this.idleTime) * 8;
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
    },

    updateBirdPhysics(dt) {
      this.velocity += GRAVITY * dt;
      this.bird.y += this.velocity * dt;

      const targetRotation = Math.min(this.velocity * 0.08, 1.5);
      this.bird.animatedSpray.rotation += (targetRotation - this.bird.animatedSpray.rotation) * 0.1 * dt;

      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
    },

    jump() {
      this.velocity = -JUMP_FORCE;
    },

    updatePipes(dt) {
      const speed = this.currentPipeSpeed * dt;

      this.pipes.forEach((pipe) => {
        pipe.x -= speed;

        if (!pipe.scored && pipe.x + 21 < this.bird.x) {
          pipe.scored = true;
          this.addScore();
        }

        if (pipe.x <= -50) {
          const rightmostX = Math.max(...this.pipes.map(p => p.x));
          pipe.x = rightmostX + PIPE_SPACING;
          pipe.By = this.randomHeight();
          pipe.scored = false;
        }

        this.updatePipePositions(pipe);
      });
    },

    addScore() {
      this.scoreText.score++;
      this.scoreText.text.text = `${this.scoreText.score}`;

      // Score pop effect
      this.scorePopScale = 1.4;

      // Switch background every N points
      if (this.scoreText.score % BG_CHANGE_INTERVAL === 0) {
        this.isNight = !this.isNight;
        this.bgSprite.texture = this.isNight ? this.bgTextures.night : this.bgTextures.day;
      }

      // Increase difficulty
      if (this.scoreText.score % DIFFICULTY_INTERVAL === 0) {
        this.currentPipeSpeed += SPEED_INCREMENT;
        if (this.currentPipeGap > MIN_PIPE_GAP) {
          this.currentPipeGap -= GAP_DECREMENT;
        }
      }
    },

    updateScorePop(dt) {
      if (this.scorePopScale > 1) {
        this.scorePopScale = Math.max(1, this.scorePopScale - 0.03 * dt);
        this.scoreText.text.scale.set(this.scorePopScale);
      }
    },

    checkCollisions() {
      const bird = getBirdBounds(this.bird);

      if (bird.bottom > GROUND_Y) {
        this.bird.y = GROUND_Y - this.bird.animatedSpray.height;
        return this.startDeath();
      }

      if (bird.top <= 0) {
        this.bird.y = 0;
        this.velocity = 0;
      }

      for (const pipe of this.pipes) {
        const topPipeY = pipe.By - PIPE_HEIGHT - this.currentPipeGap;
        const topPipe = {
          top: topPipeY,
          right: pipe.x + pipe.spriteTop.width,
          bottom: topPipeY + pipe.spriteTop.height,
          left: pipe.x,
        };
        if (rectsOverlap(bird, topPipe)) return this.startDeath();

        const bottomPipe = {
          top: pipe.By,
          right: pipe.x + pipe.spriteBottom.width,
          bottom: pipe.By + pipe.spriteBottom.height,
          left: pipe.x,
        };
        if (rectsOverlap(bird, bottomPipe)) return this.startDeath();
      }
    },

    startDeath() {
      this.dying = true;
      this.gameStart = false;
      this.velocity = -5;
      this.bird.animatedSpray.stop();
      this.deathTimer = 0;

      // White flash
      this.flashAlpha = 1;
      this.flashOverlay.alpha = 1;
    },

    updateDeathAnimation(dt) {
      this.deathTimer += dt;

      this.velocity += GRAVITY * 1.2 * dt;
      this.bird.y += this.velocity * dt;
      this.bird.animatedSpray.rotation += 0.15 * dt;

      if (this.bird.y >= GROUND_Y - this.bird.animatedSpray.height) {
        this.bird.y = GROUND_Y - this.bird.animatedSpray.height;
        this.velocity = 0;
      }

      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);

      if (this.deathTimer >= DEATH_DURATION) {
        this.finish();
      }
    },

    moveBg(dt) {
      this.bgSprite.tilePosition.x -= BG_SPEED * dt;
    },

    moveGround(dt) {
      this.ground.sprite.tilePosition.x -= GROUND_SPEED * dt;
    },

    createKeyHints() {
      const container = markRaw(new PIXI.Container());
      const keys = [
        { label: '↑', width: 28 },
        { label: 'SPACE', width: 52 },
        { label: 'TAP', width: 36 },
      ];
      const keyHeight = 22;
      const gap = 6;
      const totalWidth = keys.reduce((sum, k) => sum + k.width, 0) + gap * (keys.length - 1);
      let offsetX = (GAME_WIDTH - totalWidth) / 2;

      const keyStyle = new PIXI.TextStyle({
        fontFamily: 'BF',
        fontSize: 11,
        fontWeight: 'bold',
        fill: 0xffffff,
      });

      keys.forEach((key) => {
        const bg = markRaw(new PIXI.Graphics());
        const keyY = 340;
        bg.roundRect(offsetX, keyY + 2, key.width, keyHeight + 3, 5);
        bg.fill({ color: 0x2a1a0a, alpha: 0.5 });
        bg.roundRect(offsetX, keyY, key.width, keyHeight, 5);
        bg.fill({ color: 0x3d2b1f, alpha: 0.85 });
        bg.roundRect(offsetX, keyY, key.width, keyHeight, 5);
        bg.stroke({ color: 0xd4a056, width: 1.5, alpha: 0.7 });
        container.addChild(bg);

        const text = markRaw(new PIXI.Text({ text: key.label, style: keyStyle }));
        text.anchor.set(0.5);
        text.position.set(offsetX + key.width / 2, keyY + keyHeight / 2);
        container.addChild(text);

        offsetX += key.width + gap;
      });

      this.keyHints.container = container;
      this.app.stage.addChild(container);
    },

    handleInput() {
      if (this.dying) return;
      if (!this.gameStart) {
        this.start();
      }
      this.jump();
    },

    start() {
      this.gameStart = true;
      this.app.stage.removeChild(this.clue.sprite);
      if (this.keyHints.container) {
        this.app.stage.removeChild(this.keyHints.container);
      }
    },

    finish() {
      this.gameFinish = true;
      this.$store.dispatch('setScore', this.scoreText.score);
      this.$router.push({ name: 'game-over' });
    },

    flashKey(key) {
      clearTimeout(this.pressedKeyTimer);
      this.pressedKey = key;
      this.pressedKeyTimer = setTimeout(() => { this.pressedKey = null; }, 150);
    },

    onKeydown(e) {
      if (e.repeat) return;
      if (e.key === 'ArrowUp' || e.code === 'Space') {
        this.flashKey(e.code === 'Space' ? 'space' : 'arrowup');
        this.handleInput();
      }
    },

    onTouchend() {
      this.flashKey('tap');
      this.handleInput();
    },

    addListeners() {
      window.addEventListener('keydown', this.onKeydown);
      window.addEventListener('touchend', this.onTouchend);
    },

    removeListeners() {
      window.removeEventListener('keydown', this.onKeydown);
      window.removeEventListener('touchend', this.onTouchend);
      clearTimeout(this.pressedKeyTimer);
    },

    randomHeight() {
      return Math.round(Math.random() * (PIPE_MAX_Y - PIPE_MIN_Y) + PIPE_MIN_Y);
    },
  },
};
</script>

<style lang="scss" scoped>
.game-screen {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.wrapper {
  width: 225px;
  height: 400px;
}
.active-keys {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 8px 0 4px;
}
.key-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 26px;
  padding: 0 8px;
  border-radius: 5px;
  background: #3d2b1f;
  border: 1.5px solid #7a6249;
  box-shadow: 0 3px 0 #2a1a0a;
  color: #a09080;
  font-family: 'BF', sans-serif;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.08s ease;
  user-select: none;

  &.active {
    background: #d4a056;
    border-color: #f0c878;
    color: #fff;
    box-shadow: 0 1px 0 #b08030;
    transform: translateY(2px);
  }
}
.key-badge--wide {
  min-width: 56px;
}
</style>
