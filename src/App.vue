<template>
  <div class="container">
    <div class="wrapper"></div>
  </div>
</template>

<script>
// import { Container } from '@pixi/display';
import * as PIXI from 'pixi.js';
// import birdUrl from './assets/img/bird.png';
import bgUrl from './assets/img/bg.png';
import groundURL from './assets/img/ground.png'
import pipeBottomURL from './assets/img/pipe-bottom.png'
import pipeTopURL from './assets/img/pipe-top.png'


import charBirdImg1 from './assets/img/drags/fly-bird1.png';
import charBirdImg2 from './assets/img/drags/fly-bird2.png';
import charBirdImg3 from './assets/img/drags/fly-bird3.png';
import charBirdImg4 from './assets/img/drags/fly-bird4.png';
// import charBirdJson from './assets/spritesheet/spritesheet.json';

export default {
  data() {
    return {
      app: {
        game: null,
        wight: 225,
        height: 400,
      }, // приложение 
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3, charBirdImg4], // масив ссылок на картинки
        textureArray: [], // текстуры картинок выше
        animatedSpray: null, // анимированная анимация из 4х текстур выше 
        x: 30,
        y: 220,
      }, // птица 
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

      bgTexture: null, // бг
      groundTexture: null, //
      tilingSpriteBG: null, //
      tilingSpriteGround: null, //
    };
  },
  computed: {
    // computedTy() {
    //   return this.pipe.By - this.pipe.height - this.pipe.pipeDdistance
    // }
  },
  created() { },
  mounted() {
    this.drawPixi();
    this.listener()

  },
  methods: {
    drawPixi() {
      let wrapper = document.querySelector('.wrapper'); // елемент со страницы где будем рендерить игру
      this.app.game = new PIXI.Application({ //?  новый екзенпляр пикси жс,  
        transparent: true,
        width: this.app.wight,
        height: this.app.height,
        interactive: true,// hz
        buttonMode: true, // hz
      });

      wrapper.appendChild(this.app.game.view); // добавляем на страницу 

      this.renderSourse();
      this.stageAdd();
      this.setPositionPipe()
      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.bird.alienImages[i]);
        this.bird.textureArray.push(texture);
      }

      this.bird.animatedSpray = new PIXI.AnimatedSprite(this.bird.textureArray);  // создание анимированного спрея на основе 4х картинок
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.app.game.stage.addChild(this.bird.animatedSpray); // добавить аниммСПрей на сцену 
      this.bird.animatedSpray.animationSpeed = 0.1; // скорость анимации 
      this.bird.animatedSpray.rotation

      this.app.game.stage.interactive = true;


      this.app.game.stage.on('click', () => this.moveBird())
      this.bird.animatedSpray.play(); // запустить анимацию 


      this.app.game.ticker.add(() => { //ticker это обьект  пикси жс что запускает вызовы в каждом кадре реквест анимейшитн фрейм
        this.moveGround()
        this.moveBg();
        this.pipe.Ty = this.pipe.By - this.pipe.height - this.pipe.pipeDdistance
        this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
        this.gravitiBird()
        this.movePipe()
        this.setPositionPipe()
      });
    },
    renderSourse() {
      this.bgTexture = PIXI.Texture.from(bgUrl);
      this.pipe.pipeTextureBottom = PIXI.Texture.from(pipeBottomURL);
      this.pipe.pipeSpriteBottom = PIXI.Sprite.from(this.pipe.pipeTextureBottom)
      this.pipe.pipeTextureTop = PIXI.Texture.from(pipeTopURL);
      this.pipe.pipeSpriteTop = PIXI.Sprite.from(this.pipe.pipeTextureTop)
      this.groundTexture = PIXI.Texture.from(groundURL);

      this.tilingSpriteBG = new PIXI.TilingSprite(this.bgTexture, 225, 400);
      this.tilingSpriteGround = new PIXI.TilingSprite(this.groundTexture, 263, 86);
      this.tilingSpriteGround.position.set(0, 370);
    },
    stageAdd() {
      this.app.game.stage.addChild(this.tilingSpriteBG);
      this.app.game.stage.addChild(this.pipe.pipeSpriteBottom);
      this.app.game.stage.addChild(this.pipe.pipeSpriteTop);
      this.app.game.stage.addChild(this.tilingSpriteGround);
    },
    setPositionPipe() {
      this.pipe.pipeSpriteBottom.position.set(this.pipe.x, this.pipe.By);
      this.pipe.pipeSpriteTop.position.set(this.pipe.x, this.pipe.By - this.pipe.height - this.pipe.pipeDdistance);
    },
    gravitiBird() {
      if (this.bird.animatedSpray.rotation >= 1) {
        this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      } else {
        this.bird.animatedSpray.rotation += 0.01
      }
      this.bird.y += 2
    },
    moveBird() {
      if (this.bird.animatedSpray.rotation <= - 0.7) {
        this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      } else {
        this.bird.animatedSpray.rotation -= 0.3
      }
      this.bird.y -= 50

    },
    moveBg() {
      this.tilingSpriteBG.tilePosition.x -= 0.8;
    },
    moveGround() {
      this.tilingSpriteGround.tilePosition.x -= 1.1;
    },
    movePipe() {
      if (this.pipe.x <= -42) {
        this.pipe.x = 225
        this.pipe.By = this.randomHeight()
      }
      this.pipe.x -= 1

      let birdTop = this.bird.y;
      let birdRight = this.bird.x + this.bird.animatedSpray.width;
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let birdLeft = this.bird.x;

      let bottomPipeTop = this.pipe.By;
      let bottomPipeRight = this.pipe.x + this.pipe.pipeSpriteBottom.width;
      let bottomPipeBottom = this.pipe.By + this.pipe.pipeSpriteBottom.height;
      let bottomPipeLeft = this.pipe.x;

      // проверка столкновения нижней трубы с птицей 
      if (birdTop < bottomPipeBottom &&
        birdRight > bottomPipeLeft &&
        birdLeft < bottomPipeRight &&
        birdBottom > bottomPipeTop

      ) {
        console.log('столкновения нижней трубы');
      }



      let topPipeTop = this.pipe.By - this.pipe.height - this.pipe.pipeDdistance;
      let topPipeRight = this.pipe.x + this.pipe.pipeSpriteTop.width;
      let topPipeBottom = this.pipe.Ty + this.pipe.pipeSpriteTop.height;
      let topPipeLeft = this.pipe.x;

      // проверка столкновения верхней трубы с птицей 
      if (birdTop < topPipeBottom &&
        birdRight > topPipeLeft &&
        birdLeft < topPipeRight &&
        birdBottom > topPipeTop

      ) {
        console.log('столкновения верхней трубы');
      }


    },
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.code === "Space") {
          this.moveBird()
        }
      })
    },
    randomHeight() {
      return Math.round(Math.random() * (350 - 220) + 220)
    }
  },
};
</script>

<style lang="scss" scoped></style>
