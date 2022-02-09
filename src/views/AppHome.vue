<template>
  <div class="home"></div>
</template>

<script>

import * as PIXI from 'pixi.js';
import bgUrl from './../assets/img/bg.png';
import groundURL from './../assets/img/ground.png'

import flappyLogo from './../assets/img/flappy.png'
import birdLogo from './../assets/img/bird-l.png'

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
      bgTexture: null, // бг
      tilingSpriteBG: null, //
      factor: 1,
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
        interactive: true,// hz
        buttonMode: true, // hz
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


      // создаю контейнер для двух лого 
      this.createdContainer()
      // задаю позицию для контейнера 
      this.setPositionContainer()
      // загрyжаю текстуры лого
      this.downloadTexture()
      // создаю спрайты с текстур
      this.createdSprites()
      // добавляю спрайты в контейнер
      this.addTextureInComtainer()
      // задаю позицию  logoFlappy logoBird Bird внутри контейнера 
      this.setPositionSptitesInContainer()
      this.logoFlappy.sprite.position.set(this.logoFlappy.x, this.logoFlappy.y)
      this.logoBird.sprite.position.set(this.logoBird.x + 2, this.logoBird.y)
      this.bird.animatedSpray.position.set(this.bird.x, (this.logoContainer.container.height - this.bird.animatedSpray.height) / 2 - 4);



      this.app.game.ticker.add(() => {
            this.moveContainer()
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
    moveContainer(){
      if (this.logoContainer.y >= 150) {
        this.factor = -1
      }  else if (this.logoContainer.y  <= 140 ) {
        this.factor = 1
      }
      this.logoContainer.y += 0.25 * this.factor
      this.setPositionContainer()
    },
    downloadTexture() {
      this.logoFlappy.texture = PIXI.Texture.from(flappyLogo)
      this.logoBird.texture = PIXI.Texture.from(birdLogo)
    },
    createdSprites() {
      this.logoFlappy.sprite = PIXI.Sprite.from(this.logoFlappy.texture)
      this.logoBird.sprite = PIXI.Sprite.from(this.logoBird.texture)
    },
    addTextureInComtainer() {
      this.logoContainer.container.addChild(this.logoFlappy.sprite)
      this.logoContainer.container.addChild(this.logoBird.sprite)
      this.logoContainer.container.addChild(this.bird.animatedSpray)
    },
    setPositionSptitesInContainer() {
      this.logoFlappy.sprite.position.set(this.logoFlappy.x, this.logoFlappy.y)
      this.logoBird.sprite.position.set(this.logoBird.x + 2, this.logoBird.y)
      this.bird.animatedSpray.position.set(this.bird.x, (this.logoContainer.container.height - this.bird.animatedSpray.height) / 2 - 4);
    },

    // слушаем нажатия enter
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.startGame()
        }
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