<template>
  <div class="home"></div>
</template>

<script>

import { markRaw } from 'vue';
import * as PIXI from 'pixi.js';
import bgUrl from '@/assets/img/bg.png';
import groundURL from '@/assets/img/ground.png'
import buttonStartURL from '@/assets/img/start.png'
import flappyLogo from '@/assets/img/flappy.png'
import birdLogo from '@/assets/img/bird-l.png'

import pointer from '@/assets/img/pointer.png'

import charBirdImg1 from '@/assets/img/drags/fly-bird1.png';
import charBirdImg2 from '@/assets/img/drags/fly-bird2.png';
import charBirdImg3 from '@/assets/img/drags/fly-bird3.png';


export default {
  name: "Home",
  data() {
    return {
      app: {
        game: null,
        width: 225,
        height: 400,
      }, // application
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3], // array of image URLs
        textureArray: [], // textures from images above
        animatedSpray: null, // animated sprite from textures above
        x: 158,
        y: 0,
        width: 27,
        height: 19,
      },
      logoFlappy: {
        x: 0,
        y: 0,
        texture: null,
        sprite: null,
        width: 80,
        height: 32,
      },
      logoBird: {
        x: 85,
        y: 0,
        texture: null,
        sprite: null,
        width: 54,
        height: 28,
      },
      logoContainer: {
        container: null,
        x: 20,
        y: 150,
      },
      ground: {
        groundTexture: null, //
        tilingSpriteGround: null, //
        x: 0,
        y: 350
      },
      buttonStart: {
        width: 64,
        height: 22,
        x: 80,
        y: 270,
        texture: null,
        sprite: null,
      },
      factor: 1, // multiplier
    }
  },
  async mounted() {
    await this.drawPixi();
    this.listener()

  },
  methods: {
    startGame() {
      this.$router.push({ name: 'game' })
    },
    async drawPixi() {
      let homeWrapper = document.querySelector('.home')

      this.app.game = markRaw(new PIXI.Application());
      await this.app.game.init({
        backgroundAlpha: 0,
        width: this.app.width,
        height: this.app.height,
      })

      homeWrapper.appendChild(this.app.game.canvas);

      // load textures
      await PIXI.Assets.load([bgUrl, groundURL, buttonStartURL, flappyLogo, birdLogo, charBirdImg1, charBirdImg2, charBirdImg3]);

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = markRaw(PIXI.Texture.from(this.bird.alienImages[i]));
        this.bird.textureArray.push(texture);
      }
      this.bird.animatedSpray = markRaw(new PIXI.AnimatedSprite(this.bird.textureArray));
      this.app.game.stage.addChild(this.bird.animatedSpray)

      this.bird.animatedSpray.animationSpeed = 0.05;
      this.bird.animatedSpray.play();
      // create container for two logos
      this.createdContainer()
      // set container position
      this.setPositionContainer()
      // load textures
      this.downloadTexture()
      // create sprites from textures
      this.createdSprites()
      // add sprites to container
      this.addSpriteInContainer()
      // add sprites to game
      this.addSpriteInGame()
      // set logoFlappy, logoBird, Bird positions inside container
      this.setPositionSpritesInContainer()
      // set ground position inside game
      this.setPositionSpritesInGame()
      this.buttonStart.sprite.eventMode = 'static'
      this.buttonStart.sprite.cursor = `url(${pointer}),auto`


      this.buttonStart.sprite.on('click', () => this.startGame())

      this.app.game.ticker.add(() => {
        this.moveContainer()
        this.moveGround()
      });
    },

    createdContainer() {
      this.logoContainer.container = markRaw(new PIXI.Container())
      this.app.game.stage.addChild(this.logoContainer.container)
      this.logoContainer.container.position.set(this.logoContainer.x, this.logoContainer.y)
    },
    setPositionContainer() {
      this.logoContainer.container.position.set(this.logoContainer.x, this.logoContainer.y)
    },
    moveContainer() {
      if (this.logoContainer.y >= 150) {
        this.factor = -1
      } else if (this.logoContainer.y <= 140) {
        this.factor = 1
      }
      this.logoContainer.y += 0.25 * this.factor
      this.setPositionContainer()
    },
    moveGround() {
      this.ground.tilingSpriteGround.tilePosition.x -= 1.1;
    },
    downloadTexture() {
      this.logoFlappy.texture = markRaw(PIXI.Texture.from(flappyLogo))
      this.logoBird.texture = markRaw(PIXI.Texture.from(birdLogo))
      this.buttonStart.texture = markRaw(PIXI.Texture.from(buttonStartURL))
      this.ground.groundTexture = markRaw(PIXI.Texture.from(groundURL));
    },
    createdSprites() {
      this.logoFlappy.sprite = markRaw(new PIXI.Sprite(this.logoFlappy.texture))
      this.logoBird.sprite = markRaw(new PIXI.Sprite(this.logoBird.texture))
      this.buttonStart.sprite = markRaw(new PIXI.Sprite(this.buttonStart.texture))
      this.ground.tilingSpriteGround = markRaw(new PIXI.TilingSprite({ texture: this.ground.groundTexture, width: 263, height: 86 }));
    },
    addSpriteInContainer() {
      this.logoContainer.container.addChild(this.logoFlappy.sprite)
      this.logoContainer.container.addChild(this.logoBird.sprite)
      this.logoContainer.container.addChild(this.bird.animatedSpray)
    },
    addSpriteInGame() {
      this.app.game.stage.addChild(this.ground.tilingSpriteGround);
      this.app.game.stage.addChild(this.buttonStart.sprite);
    },
    setPositionSpritesInContainer() {
      this.logoFlappy.sprite.position.set(this.logoFlappy.x, this.logoFlappy.y)
      this.logoBird.sprite.position.set(this.logoBird.x + 2, this.logoBird.y)
      this.bird.animatedSpray.position.set(this.bird.x, (this.logoContainer.container.height - this.bird.animatedSpray.height) / 2 - 4);
    },
    setPositionSpritesInGame() {
      this.ground.tilingSpriteGround.position.set(this.ground.x, this.ground.y);
      this.buttonStart.sprite.position.set(this.buttonStart.x, this.buttonStart.y);
    },
    // listen for Enter key press
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.startGame()
        }
      })
      window.addEventListener('touchend', (e) => {
        this.startGame()
      })
    },
  }
}
</script>

<style lang="scss">
.home {
  width: 225px;
  height: 400px;
  flex-grow: 1;
  background-image: url("./../assets/img/bg.png");
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.home__logo-anim {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.home__logo-wrapper {
}
.home__logo-wrapper-img {
}
.home__logo-anim-img {
  width: 27px;
  height: 19px;
}
.home__logo-button {
  background-color: transparent;
  border: none;
  height: 22px;
  width: 64px;
  margin: 70px auto 0;
  transition: 0.5s;
  cursor: pointer;
  &:hover {
    transform: translateY(-10px);
  }
}
.home__logo-button-img {
}
</style>
