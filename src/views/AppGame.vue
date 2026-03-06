<template>
  <div class="game-screen">
    <div class="wrapper" ref="canvas"></div>
    <div class="active-keys">
      <span :class="['key-badge', { active: pressedKey === 'arrowup' }]">↑</span>
      <span :class="['key-badge', 'key-badge--wide', { active: pressedKey === 'space' }]">SPACE</span>
      <span :class="['key-badge', { active: pressedKey === 'tap' }]">TAP</span>
      <span :class="['key-badge', { active: paused }]">P</span>
      <span class="key-badge key-badge--mute" @click="onMuteClick">{{ muted ? '🔇' : '🔊' }}</span>
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
import { playFlap, playScore, playHit, playSwoosh, toggleMute, isMuted } from '@/utils/sound';
import { getSelectedSkin } from '@/utils/skins';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_Y, GROUND_WIDTH, GROUND_HEIGHT,
  PIPE_HEIGHT, PIPE_GAP, PIPE_MIN_Y, PIPE_MAX_Y, PIPE_SPACING, PIPE_SPACING_VARIANCE, PIPE_COUNT,
  GRAVITY, JUMP_FORCE, PIPE_SPEED, BG_SPEED, GROUND_SPEED,
  SPEED_INCREMENT, GAP_DECREMENT, MIN_PIPE_GAP, DIFFICULTY_INTERVAL,
  DEATH_DURATION, COMBO_MARGIN,
} from '@/utils/constants';

const BIRD_IMAGES = [charBirdImg1, charBirdImg2, charBirdImg3];
const ALL_ASSETS = [bgUrl, bg2Url, groundURL, pipeBottomURL, pipeTopURL, clueTapURL, ...BIRD_IMAGES];
const BG_CHANGE_INTERVAL = 10;
const SHAKE_DURATION = 8;
const SHAKE_INTENSITY = 4;
const FEATHER_COUNT = 6;
const FEATHER_COLORS = [0xffffff, 0xffe082, 0xffcc80, 0xff8a65];
const CLOUD_COUNT = 3;
const TRAIL_LENGTH = 5;
const TRAIL_INTERVAL = 3;

export default {
  name: 'AppGame',
  data() {
    return {
      gameStart: false,
      gameFinish: false,
      dying: false,
      paused: false,
      muted: isMuted(),
      deathTimer: 0,
      app: null,
      bird: { animatedSpray: null, x: 30, y: 150 },
      velocity: 0,
      idleTime: 0,
      idleBaseY: 150,
      pipes: [],
      clouds: [],
      ground: { sprite: null, x: 0 },
      clue: { sprite: null, x: 82, y: 200 },
      keyHints: { container: null },
      scoreText: { text: null, score: 0, y: 30 },
      bestScoreLine: null,
      bestScoreLabel: null,
      bestRecord: 0,
      scorePopScale: 1,
      bgSprite: null,
      bgTextures: { day: null, night: null },
      isNight: false,
      flashOverlay: null,
      flashAlpha: 0,
      pauseOverlay: null,
      pauseText: null,
      shakeTimer: 0,
      feathers: [],
      trail: [],
      trailCounter: 0,
      comboTexts: [],
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
        if (!this.gameFinish && !this.paused) {
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

        if (this.flashAlpha > 0) {
          this.flashAlpha = Math.max(0, this.flashAlpha - 0.08 * dt);
          this.flashOverlay.alpha = this.flashAlpha;
        }

        if (this.shakeTimer > 0) {
          this.shakeTimer -= dt;
          const intensity = SHAKE_INTENSITY * (this.shakeTimer / SHAKE_DURATION);
          this.app.stage.position.set(
            (Math.random() - 0.5) * intensity * 2,
            (Math.random() - 0.5) * intensity * 2,
          );
          if (this.shakeTimer <= 0) {
            this.app.stage.position.set(0, 0);
          }
        }

        this.updateFeathers(dt);
        this.updateClouds(dt);
        this.updateComboTexts(dt);
        this.updateTrail(dt);

        if (this.paused) return;

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
      this.bestRecord = parseInt(localStorage.getItem('record') || '0', 10);

      // Background
      this.bgTextures.day = markRaw(PIXI.Texture.from(bgUrl));
      this.bgTextures.night = markRaw(PIXI.Texture.from(bg2Url));
      const bg = createTilingSprite(bgUrl, GAME_WIDTH, GAME_HEIGHT);
      this.bgSprite = bg.sprite;

      // Clouds
      for (let i = 0; i < CLOUD_COUNT; i++) {
        const cloud = markRaw(new PIXI.Graphics());
        const w = 30 + Math.random() * 25;
        const h = 10 + Math.random() * 8;
        cloud.ellipse(0, 0, w / 2, h / 2);
        cloud.fill({ color: 0xffffff, alpha: 0.35 + Math.random() * 0.2 });
        const x = Math.random() * GAME_WIDTH;
        const y = 20 + Math.random() * 100;
        cloud.position.set(x, y);
        this.clouds.push({
          graphic: cloud,
          speed: 0.15 + Math.random() * 0.25,
        });
      }

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

      // Best score line
      if (this.bestRecord > 0) {
        this.bestScoreLine = markRaw(new PIXI.Graphics());
        this.bestScoreLine.alpha = 0;

        this.bestScoreLabel = createText(`best: ${this.bestRecord}`, {
          fontFamily: 'BF',
          fontSize: 9,
          fill: 0xffd700,
          stroke: { color: 0x000000, width: 2 },
        });
        this.bestScoreLabel.anchor.set(1, 1);
        this.bestScoreLabel.position.set(GAME_WIDTH - 4, -2);
        this.bestScoreLabel.alpha = 0;
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
      this.bird.animatedSpray.tint = getSelectedSkin().tint;
      this.bird.animatedSpray.play();

      // Flash overlay
      this.flashOverlay = markRaw(new PIXI.Graphics());
      this.flashOverlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.flashOverlay.fill({ color: 0xffffff });
      this.flashOverlay.alpha = 0;

      // Pause overlay
      this.pauseOverlay = markRaw(new PIXI.Graphics());
      this.pauseOverlay.rect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.pauseOverlay.fill({ color: 0x000000, alpha: 0.5 });
      this.pauseOverlay.visible = false;

      this.pauseText = createText('PAUSED', {
        fontFamily: 'BF',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 5 },
      });
      this.pauseText.anchor.set(0.5);
      this.pauseText.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      this.pauseText.visible = false;
    },

    addToStage() {
      const stage = this.app.stage;
      stage.addChild(this.bgSprite);

      // Clouds behind pipes
      this.clouds.forEach(c => stage.addChild(c.graphic));

      // Best score line (behind pipes, above clouds)
      if (this.bestScoreLine) {
        stage.addChild(this.bestScoreLine);
        stage.addChild(this.bestScoreLabel);
      }

      this.pipes.forEach((pipe) => {
        stage.addChild(pipe.spriteBottom);
        stage.addChild(pipe.spriteTop);
      });
      stage.addChild(this.ground.sprite);
      stage.addChild(this.clue.sprite);
      stage.addChild(this.scoreText.text);
      stage.addChild(this.bird.animatedSpray);
      stage.addChild(this.flashOverlay);
      stage.addChild(this.pauseOverlay);
      stage.addChild(this.pauseText);
    },

    updateClouds(dt) {
      this.clouds.forEach(c => {
        c.graphic.position.x -= c.speed * dt;
        if (c.graphic.position.x < -40) {
          c.graphic.position.x = GAME_WIDTH + 40;
          c.graphic.position.y = 20 + Math.random() * 100;
        }
      });
    },

    updateBestScoreLine() {
      if (!this.bestScoreLine || this.bestRecord <= 0) return;
      // Show line only when approaching the record
      const diff = this.bestRecord - this.scoreText.score;
      if (diff <= 3 && diff >= -1) {
        this.bestScoreLine.clear();
        const y = this.bird.y;
        for (let x = 0; x < GAME_WIDTH; x += 8) {
          this.bestScoreLine.rect(x, y, 4, 1);
        }
        this.bestScoreLine.fill({ color: 0xffd700, alpha: 0.6 });
        this.bestScoreLine.alpha = 1;
        this.bestScoreLabel.alpha = 1;
        this.bestScoreLabel.position.y = y - 2;
      }
      if (this.scoreText.score > this.bestRecord) {
        this.bestScoreLine.alpha = 0;
        this.bestScoreLabel.alpha = 0;
      }
    },

    updatePipePositions(pipe) {
      pipe.spriteBottom.position.set(pipe.x, pipe.By);
      pipe.spriteTop.position.set(pipe.x, pipe.By - PIPE_HEIGHT - this.currentPipeGap);
    },

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
      playFlap();
    },

    updatePipes(dt) {
      const speed = this.currentPipeSpeed * dt;

      this.pipes.forEach((pipe) => {
        pipe.x -= speed;

        if (!pipe.scored && pipe.x + 21 < this.bird.x) {
          pipe.scored = true;
          this.addScore(pipe);
        }

        if (pipe.x <= -50) {
          const rightmostX = Math.max(...this.pipes.map(p => p.x));
          const variance = (Math.random() - 0.5) * 2 * PIPE_SPACING_VARIANCE;
          pipe.x = rightmostX + PIPE_SPACING + variance;
          pipe.By = this.randomHeight();
          pipe.scored = false;
        }

        this.updatePipePositions(pipe);
      });
    },

    addScore(pipe) {
      // Check combo — bird is close to pipe edges
      const birdCenter = this.bird.y + 9.5;
      const gapTop = pipe.By - this.currentPipeGap;
      const gapBottom = pipe.By;
      const topDist = birdCenter - gapTop;
      const bottomDist = gapBottom - birdCenter;
      const isCombo = topDist < COMBO_MARGIN || bottomDist < COMBO_MARGIN;

      const points = isCombo ? 2 : 1;
      this.scoreText.score += points;
      this.scoreText.text.text = `${this.scoreText.score}`;
      this.scorePopScale = isCombo ? 1.7 : 1.4;
      playScore();

      if (isCombo) {
        this.spawnComboText();
      }

      this.updateBestScoreLine();

      if (this.scoreText.score % BG_CHANGE_INTERVAL === 0) {
        this.isNight = !this.isNight;
        this.bgSprite.texture = this.isNight ? this.bgTextures.night : this.bgTextures.day;
      }

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

    spawnFeathers() {
      for (let i = 0; i < FEATHER_COUNT; i++) {
        const g = markRaw(new PIXI.Graphics());
        const color = FEATHER_COLORS[Math.floor(Math.random() * FEATHER_COLORS.length)];
        g.circle(0, 0, 2 + Math.random() * 2);
        g.fill({ color });
        g.position.set(this.bird.x + 13, this.bird.y + 10);
        this.app.stage.addChild(g);
        this.feathers.push({
          graphic: g,
          vx: (Math.random() - 0.5) * 4,
          vy: -2 - Math.random() * 3,
          life: 30 + Math.random() * 20,
        });
      }
    },

    updateFeathers(dt) {
      for (let i = this.feathers.length - 1; i >= 0; i--) {
        const f = this.feathers[i];
        f.vx *= 0.98;
        f.vy += 0.15 * dt;
        f.graphic.position.x += f.vx * dt;
        f.graphic.position.y += f.vy * dt;
        f.life -= dt;
        f.graphic.alpha = Math.max(0, f.life / 30);
        if (f.life <= 0) {
          this.app.stage.removeChild(f.graphic);
          f.graphic.destroy();
          this.feathers.splice(i, 1);
        }
      }
    },

    // Combo floating text
    spawnComboText() {
      const text = createText('NICE! +2', {
        fontFamily: 'BF',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffd700,
        stroke: { color: 0x000000, width: 3 },
      });
      text.anchor.set(0.5);
      text.position.set(this.bird.x + 14, this.bird.y - 10);
      this.app.stage.addChild(text);
      this.comboTexts.push({ text, life: 40, vy: -1 });
    },

    updateComboTexts(dt) {
      for (let i = this.comboTexts.length - 1; i >= 0; i--) {
        const c = this.comboTexts[i];
        c.life -= dt;
        c.text.position.y += c.vy * dt;
        c.text.alpha = Math.max(0, c.life / 25);
        if (c.life <= 0) {
          this.app.stage.removeChild(c.text);
          c.text.destroy();
          this.comboTexts.splice(i, 1);
        }
      }
    },

    // Bird trail
    updateTrail(dt) {
      this.trailCounter += dt;
      if (this.trailCounter >= TRAIL_INTERVAL && this.gameStart && !this.dying) {
        this.trailCounter = 0;
        const dot = markRaw(new PIXI.Graphics());
        dot.circle(0, 0, 2);
        dot.fill({ color: 0xffffff, alpha: 0.4 });
        dot.position.set(this.bird.x, this.bird.y + 9.5);
        // Insert behind bird
        const birdIndex = this.app.stage.getChildIndex(this.bird.animatedSpray);
        this.app.stage.addChildAt(dot, birdIndex);
        this.trail.push({ graphic: dot, life: 15 });
      }
      // Fade existing
      for (let i = this.trail.length - 1; i >= 0; i--) {
        const t = this.trail[i];
        t.life -= dt;
        t.graphic.alpha = Math.max(0, (t.life / 15) * 0.4);
        if (t.life <= 0) {
          this.app.stage.removeChild(t.graphic);
          t.graphic.destroy();
          this.trail.splice(i, 1);
        }
      }
      // Limit trail length
      while (this.trail.length > TRAIL_LENGTH) {
        const old = this.trail.shift();
        this.app.stage.removeChild(old.graphic);
        old.graphic.destroy();
      }
    },

    vibrate(ms) {
      if (navigator.vibrate) navigator.vibrate(ms);
    },

    startDeath() {
      this.dying = true;
      this.gameStart = false;
      this.velocity = -5;
      this.bird.animatedSpray.stop();
      this.deathTimer = 0;
      this.flashAlpha = 1;
      this.flashOverlay.alpha = 1;
      this.shakeTimer = SHAKE_DURATION;
      this.spawnFeathers();
      playHit();
      this.vibrate(50);
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

    togglePause() {
      if (!this.gameStart || this.dying || this.gameFinish) return;
      this.paused = !this.paused;
      this.pauseOverlay.visible = this.paused;
      this.pauseText.visible = this.paused;
      if (this.paused) {
        this.bird.animatedSpray.stop();
      } else {
        this.bird.animatedSpray.play();
      }
    },

    onMuteClick() {
      this.muted = toggleMute();
    },

    handleInput() {
      if (this.dying || this.paused) return;
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
      playSwoosh();
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
      if (e.key === 'm' || e.key === 'M') {
        return this.onMuteClick();
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        return this.togglePause();
      }
      if (this.paused) return;
      if (e.key === 'ArrowUp' || e.code === 'Space') {
        this.flashKey(e.code === 'Space' ? 'space' : 'arrowup');
        this.handleInput();
      }
    },

    onTouchend() {
      if (this.paused) return;
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

  &--mute {
    cursor: pointer;
    font-size: 14px;
    &:hover {
      border-color: #d4a056;
    }
  }
}
.key-badge--wide {
  min-width: 56px;
}
</style>
