<template>
  <div class="game-screen">
    <div class="wrapper"></div>
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
import groundURL from '@/assets/img/ground.png'
import pipeBottomURL from '@/assets/img/pipe-bottom.png'
import pipeTopURL from '@/assets/img/pipe-top.png'
import clueTapURL from '@/assets/img/clue-tap.png'



import charBirdImg1 from '@/assets/img/drags/fly-bird1.png';
import charBirdImg2 from '@/assets/img/drags/fly-bird2.png';
import charBirdImg3 from '@/assets/img/drags/fly-bird3.png';


export default {
  name: 'AppGame',
  data() {
    return {
      gameStart: false,
      gameFinish: false,
      counterStart: 0,
      app: {
        game: null,
        width: 225,
        height: 400,
      }, // application
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3], // array of image URLs
        textureArray: [], // textures from images above
        animatedSpray: null, // animated sprite from textures above
        x: 30,
        y: 150,
      }, // bird
      pipe: {
        pipeTextureBottom: null, //
        pipeSpriteBottom: null, //
        pipeTextureTop: null, //
        pipeSpriteTop: null, //
        pipeDdistance: 100,
        x: 255,
        By: 200,
        Ty: 0,
        height: 251,

      },
      ground: {
        groundTexture: null, //
        tilingSpriteGround: null, //
        x: 0,
        y: 370
      },
      clue: {
        textureClue: null,
        spriteClue: null,
        x: 82,
        y: 200,
      },
      keyHints: {
        container: null,
      },
      scoreText: {
        style: null,
        text: '0',
        score: 0,
        x: 100,
        y: 30,
      },
      bgTexture: null, // background
      tilingSpriteBG: null, //
      countSin: 0,
      jumping: 0,
      pressedKey: null,
      pressedKeyTimer: null,
    };
  },
  created() { },
  async mounted() {
    await this.drawPixi();
    this.listener()
  },
  methods: {
    async drawPixi() {
      let wrapper = document.querySelector('.wrapper'); // page element where we render the game
      this.app.game = markRaw(new PIXI.Application());
      await this.app.game.init({
        backgroundAlpha: 0,
        width: this.app.width,
        height: this.app.height,
      });

      this.app.game.stage.eventMode = 'static';
      this.app.game.stage.hitArea = this.app.game.screen;

      this.app.game.stage.on('click', () => {
        if (!this.gameFinish) {
          this.flashKey('tap');
          if (!this.gameStart) {
            this.start()
          } else {
            this.jumping = 8
          }
        }
      })

      wrapper.appendChild(this.app.game.canvas); // render on page

      // load textures
      await PIXI.Assets.load([bgUrl, groundURL, pipeBottomURL, pipeTopURL, clueTapURL, charBirdImg1, charBirdImg2, charBirdImg3]);

      this.addText() // add text to the stage
      this.renderSourse(); // load all images
      this.stageAdd(); // add textures to the stage
      this.setPositionPipe() // set pipe positions
      this.setPositionClue()
      this.createKeyHints()
      this.setPositionScoreText()

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = markRaw(PIXI.Texture.from(this.bird.alienImages[i]));
        this.bird.textureArray.push(texture);
      }

      this.createdAnimatedSprite()


      this.app.game.ticker.add(() => { // ticker is a Pixi.js object that runs callbacks on each animation frame
        if (!this.gameFinish) {
          this.moveGround()
          this.moveBg();
          if (this.gameStart) {
            if (this.jumping) {
              this.moveBird()
            }
            if (this.jumping >= 50) {
              this.jumping = 0
            }

            this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
            this.gravitiBird()
            this.movePipe()
            this.setPositionPipe()
            this.hitTopPipe()
            this.hitBottomPipe()
            this.hitGround()
            this.climbsBorders()

          }
        } else {
          this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
          this.circulationBird()
        }

      });


    },
    // load all images
    renderSourse() {
      this.bgTexture = markRaw(PIXI.Texture.from(bgUrl));
      this.pipe.pipeTextureBottom = markRaw(PIXI.Texture.from(pipeBottomURL));
      this.pipe.pipeSpriteBottom = markRaw(new PIXI.Sprite(this.pipe.pipeTextureBottom))
      this.pipe.pipeTextureTop = markRaw(PIXI.Texture.from(pipeTopURL));
      this.pipe.pipeSpriteTop = markRaw(new PIXI.Sprite(this.pipe.pipeTextureTop))
      this.ground.groundTexture = markRaw(PIXI.Texture.from(groundURL));

      this.clue.textureClue = markRaw(PIXI.Texture.from(clueTapURL))
      this.clue.spriteClue = markRaw(new PIXI.Sprite(this.clue.textureClue))



      this.tilingSpriteBG = markRaw(new PIXI.TilingSprite({ texture: this.bgTexture, width: 225, height: 400 }));
      this.ground.tilingSpriteGround = markRaw(new PIXI.TilingSprite({ texture: this.ground.groundTexture, width: 263, height: 86 }));
      this.ground.tilingSpriteGround.position.set(this.ground.x, this.ground.y);
    },
    createdAnimatedSprite() {
      this.bird.animatedSpray = markRaw(new PIXI.AnimatedSprite(this.bird.textureArray));  // create animated sprite from textures
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.app.game.stage.addChild(this.bird.animatedSpray); // add animated sprite to the stage
      this.bird.animatedSpray.animationSpeed = 0.12; // animation speed
      this.bird.animatedSpray.rotation
      // this.bird.animatedSpray.anchor.set(0.5) // set sprite center
      this.bird.animatedSpray.width = 27
      this.bird.animatedSpray.height = 19

      this.bird.animatedSpray.scale.x = 1
      this.bird.animatedSpray.scale.y = 1
      this.bird.animatedSpray.play(); // start animation
    },
    addText() {
      this.scoreText.text = markRaw(new PIXI.Text({
        text: this.scoreText.text,
        style: new PIXI.TextStyle({
          fontFamily: 'BF',
          fontSize: 30,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: { color: 0x000000, width: 5 },
        })
      }));
    },
    stageAdd() {
      // add to the stage
      this.app.game.stage.addChild(this.tilingSpriteBG);
      this.app.game.stage.addChild(this.pipe.pipeSpriteBottom);
      this.app.game.stage.addChild(this.pipe.pipeSpriteTop);
      this.app.game.stage.addChild(this.ground.tilingSpriteGround);
      this.app.game.stage.addChild(this.clue.spriteClue);

      this.app.game.stage.addChild(this.scoreText.text) // add text
    },
    // set top and bottom pipe positions
    setPositionPipe() {
      this.pipe.pipeSpriteBottom.position.set(this.pipe.x, this.pipe.By);
      this.pipe.pipeSpriteTop.position.set(this.pipe.x, this.pipe.By - this.pipe.height - this.pipe.pipeDdistance);
    },
    setPositionClue() {
      this.clue.spriteClue.position.set(this.clue.x, this.clue.y)
    },
    setPositionText() {
      this.clue.spriteClue.position.set(this.clue.x, this.clue.y)
    },
    setPositionScoreText() {
      const width = (this.app.width / 2) - 10
      this.scoreText.text.position.set(width, this.scoreText.y)
    },
    setScoreText() {
      this.scoreText.score++
      this.scoreText.text.text = `${this.scoreText.score}`
    },
    // bird falling (gravity)
    gravitiBird() {
      if (this.bird.animatedSpray.rotation >= 1) {
        this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      } else {
        this.bird.animatedSpray.rotation += 0.02
      }
      this.bird.y += 2
    },
    // bird movement on click
    moveBird() {
      this.bird.animatedSpray.rotation = - 0.6
      this.bird.y -= 10
      this.jumping += 8
    },
    // on game over: spin and scale up the bird
    circulationBird() {
      this.countSin += 0.001
      if (this.countSin > 0.1) {
        this.countSin = 0
      } else {
        this.bird.animatedSpray.rotation += 0.1
        this.bird.animatedSpray.scale.x += Math.sin(this.countSin)
        this.bird.animatedSpray.scale.y += Math.sin(this.countSin)
      }
      if (this.bird.y > 200) {
        this.bird.y -= 10
      } else {
        this.bird.y -= 4
      }
      this.bird.x += 2
    },
    // background movement
    moveBg() {
      this.tilingSpriteBG.tilePosition.x -= 1.2;
    },

    // ground movement
    moveGround() {
      this.ground.tilingSpriteGround.tilePosition.x -= 2.2;
    },
    // pipe movement
    movePipe() {
      this.pipe.Ty = this.pipe.By - this.pipe.height - this.pipe.pipeDdistance

      if (this.pipe.x < this.bird.x && this.pipe.x > this.bird.x - 2) {
        this.setScoreText()
      }

      if (this.pipe.x <= -42) {
        this.pipe.x = 225
        this.pipe.By = this.randomHeight()
      }
      this.pipe.x -= 2
    },
    // collision with top pipe
    hitTopPipe() {
      // bird sides
      let birdTop = this.bird.y;
      let birdRight = this.bird.x + this.bird.animatedSpray.width;
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let birdLeft = this.bird.x;
      // top pipe sides
      let topPipeTop = this.pipe.By - this.pipe.height - this.pipe.pipeDdistance;
      let topPipeRight = this.pipe.x + this.pipe.pipeSpriteTop.width;
      let topPipeBottom = this.pipe.Ty + this.pipe.pipeSpriteTop.height;
      let topPipeLeft = this.pipe.x;

      // check collision between top pipe and bird
      if (birdTop < topPipeBottom &&
        birdRight > topPipeLeft &&
        birdLeft < topPipeRight &&
        birdBottom > topPipeTop

      ) {
        this.finish()
        console.log('top pipe collision');
      }
    },
    // collision with bottom pipe
    hitBottomPipe() {
      let birdTop = this.bird.y;
      let birdRight = this.bird.x + this.bird.animatedSpray.width;
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let birdLeft = this.bird.x;

      let bottomPipeTop = this.pipe.By;
      let bottomPipeRight = this.pipe.x + this.pipe.pipeSpriteBottom.width;
      let bottomPipeBottom = this.pipe.By + this.pipe.pipeSpriteBottom.height;
      let bottomPipeLeft = this.pipe.x;

      // check collision between bottom pipe and bird
      if (birdTop < bottomPipeBottom &&
        birdRight > bottomPipeLeft &&
        birdLeft < bottomPipeRight &&
        birdBottom > bottomPipeTop

      ) {
        console.log('bottom pipe collision');
        this.finish()
      }
    },
    // collision with ground
    hitGround() {
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let groundTop = this.ground.tilingSpriteGround.y
      if (birdBottom > groundTop) {
        console.log('ground collision');
        this.finish()
      }
    },
    // out of bounds
    climbsBorders() {
      let birdTop = this.bird.y;
      if (birdTop <= 0) {
        console.log('out of bounds');
      }

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
      let offsetX = (this.app.width - totalWidth) / 2;

      const keyStyle = new PIXI.TextStyle({
        fontFamily: 'BF',
        fontSize: 11,
        fontWeight: 'bold',
        fill: 0xffffff,
      });

      keys.forEach((key) => {
        const bg = markRaw(new PIXI.Graphics());
        const keyY = 340;
        // key shadow
        bg.roundRect(offsetX, keyY + 2, key.width, keyHeight + 3, 5);
        bg.fill({ color: 0x2a1a0a, alpha: 0.5 });
        // key face
        bg.roundRect(offsetX, keyY, key.width, keyHeight, 5);
        bg.fill({ color: 0x3d2b1f, alpha: 0.85 });
        // key border
        bg.roundRect(offsetX, keyY, key.width, keyHeight, 5);
        bg.stroke({ color: 0xd4a056, width: 1.5, alpha: 0.7 });
        container.addChild(bg);

        const text = markRaw(new PIXI.Text({
          text: key.label,
          style: keyStyle,
        }));
        text.anchor.set(0.5);
        text.position.set(offsetX + key.width / 2, keyY + keyHeight / 2);
        container.addChild(text);

        offsetX += key.width + gap;
      });

      this.keyHints.container = container;
      this.app.game.stage.addChild(container);
    },
    start() {
      this.gameStart = !this.gameStart
      this.app.game.stage.removeChild(this.clue.spriteClue);
      if (this.keyHints.container) {
        this.app.game.stage.removeChild(this.keyHints.container);
      }
    },
    finish() {
      this.gameStart = !this.gameStart
      this.gameFinish = true
      this.$store.dispatch('setScore', this.scoreText.score)

      this.$router.push({ name: 'game-over' })
    },
    chekGame() {
      if (!this.gameStart) {
        this.start()
      } else {
        this.moveBird()
      }
    },
    flashKey(key) {
      clearTimeout(this.pressedKeyTimer);
      this.pressedKey = key;
      this.pressedKeyTimer = setTimeout(() => { this.pressedKey = null }, 150);
    },
    // listen for key presses
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.repeat) return;
        if (e.key === 'ArrowUp' || e.code === "Space") {
          this.flashKey(e.code === 'Space' ? 'space' : 'arrowup');
          this.chekGame()
        }
      })
      window.addEventListener('touchend', (e) => {
        this.flashKey('tap');
        this.chekGame()
      })
    },
    // random pipe height
    randomHeight() {
      return Math.round(Math.random() * (350 - 220) + 220)
    }
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
