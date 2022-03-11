<template>
  <div class="home"></div>
</template>

<script>

import * as PIXI from 'pixi.js';
import bgUrl from './../assets/img/bg.png';
import groundURL from './../assets/img/ground.png'
import buttonStartURL from './../assets/img/start.png'
import flappyLogo from './../assets/img/flappy.png'
import birdLogo from './../assets/img/bird-l.png'

import pointer from './../assets/img/pointer.png'

import charBirdImg1 from './../assets/img/drags/fly-bird1.png';
import charBirdImg2 from './../assets/img/drags/fly-bird2.png';
import charBirdImg3 from './../assets/img/drags/fly-bird3.png';


export default {
  name: "Home",
  data() {
    return {
      app: {
        game: null,
        width: 225,
        height: 400,
      }, // приложение 
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3], // масив ссылок на картинки
        textureArray: [], // текстуры картинок выше
        animatedSpray: null, // анимированная анимация из 4х текстур выше 
        x: 158,
        y: 0,
        width: 27,
        height: 19,
      },
      ground: {
        groundTexture: null, // 
        tilingSpriteGround: null, //
        x: 0,
        y: 370
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
      logoContainer: {
        container: null,
        x: 20,
        y: 150,
      },
      factor: 1, // множитель 
    }
  },
  mounted() {
    this.drawPixi();
    this.listener()

  },
  methods: {
    startGame() {
      this.$router.push({ name: 'game' })
    },
    drawPixi() {
      let homeWrapper = document.querySelector('.home')

      this.app.game = new PIXI.Application({
        transparent: true,
        width: this.app.width,
        height: this.app.height,

      })

      homeWrapper.appendChild(this.app.game.view);

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.bird.alienImages[i]);
        this.bird.textureArray.push(texture);
      }
      this.bird.animatedSpray = new PIXI.AnimatedSprite(this.bird.textureArray);
      this.app.game.stage.addChild(this.bird.animatedSpray)

      this.bird.animatedSpray.animationSpeed = 0.05;
      this.bird.animatedSpray.play();
      //  указываю на что изменять курсор если наведено на кнопку 
      this.setCursorPointer()
      // создаю контейнер для двух лого 
      this.createdContainer()
      // задаю позицию для контейнера 
      this.setPositionContainer()
      // загрyжаю текстуры 
      this.downloadTexture()
      // создаю спрайты с текстур
      this.createdSprites()
      // добавляю спрайты в контейнер
      this.addSpriteInContainer()
      // добавляю спрайты в game
      this.addSpriteInGame()
      // задаю позицию  logoFlappy logoBird Bird внутри контейнера 
      this.setPositionSpritesInContainer()
      // задаю позицию  ground внутри game 
      this.setPositionSpritesInGame()
      this.buttonStart.sprite.interactive = true
      this.buttonStart.sprite.buttonMode = true


      this.buttonStart.sprite.on('click', () => this.startGame())

      this.app.game.ticker.add(() => {
        this.moveContainer()
        this.moveGround()
      });
    },

    createdContainer() {
      this.logoContainer.container = new PIXI.Container()
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
      this.logoFlappy.texture = PIXI.Texture.from(flappyLogo)
      this.logoBird.texture = PIXI.Texture.from(birdLogo)
      this.buttonStart.texture = PIXI.Texture.from(buttonStartURL)
      this.ground.groundTexture = PIXI.Texture.from(groundURL);
    },
    createdSprites() {
      this.logoFlappy.sprite = PIXI.Sprite.from(this.logoFlappy.texture)
      this.logoBird.sprite = PIXI.Sprite.from(this.logoBird.texture)
      this.buttonStart.sprite = PIXI.Sprite.from(this.buttonStart.texture)
      this.ground.tilingSpriteGround = new PIXI.TilingSprite(this.ground.groundTexture, 263, 86);
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
    setCursorPointer() {
      const pointerIcon = `url(${pointer}),auto`
      this.app.game.renderer.plugins.interaction.cursorStyles.pointer = pointerIcon;
    },
    // слушаем нажатия enter
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