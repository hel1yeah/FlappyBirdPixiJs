<template>
  <div class="wrapper"></div>
</template>

<script>

import * as PIXI from 'pixi.js';
import bgUrl from './../assets/img/bg.png';
import groundURL from './../assets/img/ground.png'
import pipeBottomURL from './../assets/img/pipe-bottom.png'
import pipeTopURL from './../assets/img/pipe-top.png'


import charBirdImg1 from './../assets/img/drags/fly-bird1.png';
import charBirdImg2 from './../assets/img/drags/fly-bird2.png';
import charBirdImg3 from './../assets/img/drags/fly-bird3.png';


export default {
  name: 'AppGame',
  data() {
    return {
      game: false,
      counterStart: 0,
      app: {
        game: null,
        width: 225,
        height: 400,
      }, // приложение 
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3], // масив ссылок на картинки
        textureArray: [], // текстуры картинок выше
        animatedSpray: null, // анимированная анимация из 4х текстур выше 
        x: 30,
        y: 150,
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
      ground: {
        groundTexture: null, // 
        tilingSpriteGround: null, //
        x: 0,
        y: 370
      },
      bgTexture: null, // бг
      tilingSpriteBG: null, //

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
        width: this.app.width,
        height: this.app.height,
        interactive: true,// hz
        buttonMode: true, // hz
      });

      this.app.game.stage.on('click', () => {
        if (!this.game) {
          this.app.game.stage.on('click', () => this.setCounterStart())
        } else {
          this.moveBird()
          
        }
      })

      wrapper.appendChild(this.app.game.view); // показывем на страницуе 
      this.app.game.stage.interactive = true;
      this.renderSourse();  // загрузка всех картинок 
      this.stageAdd(); // добавление на сцену текстур
      this.setPositionPipe() // установка и размещение труб

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.bird.alienImages[i]);
        this.bird.textureArray.push(texture);
      }

      this.bird.animatedSpray = new PIXI.AnimatedSprite(this.bird.textureArray);  // создание анимированного спрея на основе 4х картинок
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.app.game.stage.addChild(this.bird.animatedSpray); // добавить аниммСПрей на сцену 
      this.bird.animatedSpray.animationSpeed = 0.12; // скорость анимации 
      this.bird.animatedSpray.rotation
      this.bird.animatedSpray.width = 27
      this.bird.animatedSpray.height = 19


      this.bird.animatedSpray.play(); // запустить анимацию 





      this.app.game.ticker.add(() => { //ticker это обьект  пикси жс что запускает вызовы в каждом кадре реквест анимейшитн фрейм
        this.moveGround()
        this.moveBg();
        if (this.game) {

          this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
          this.gravitiBird()
          this.movePipe()
          this.setPositionPipe()
          this.hitTopPipe()
          this.hitBottomPipe()
          this.hitGround()
          this.climbsBorders()
        }


      });


    },
    // загрузка всех картинок 
    renderSourse() {
      this.bgTexture = PIXI.Texture.from(bgUrl);
      this.pipe.pipeTextureBottom = PIXI.Texture.from(pipeBottomURL);
      this.pipe.pipeSpriteBottom = PIXI.Sprite.from(this.pipe.pipeTextureBottom)
      this.pipe.pipeTextureTop = PIXI.Texture.from(pipeTopURL);
      this.pipe.pipeSpriteTop = PIXI.Sprite.from(this.pipe.pipeTextureTop)
      this.ground.groundTexture = PIXI.Texture.from(groundURL);

      this.tilingSpriteBG = new PIXI.TilingSprite(this.bgTexture, 225, 400);
      this.ground.tilingSpriteGround = new PIXI.TilingSprite(this.ground.groundTexture, 263, 86);
      this.ground.tilingSpriteGround.position.set(this.ground.x, this.ground.y);
    },
    stageAdd() {
      // добавление на сцену 
      this.app.game.stage.addChild(this.tilingSpriteBG);
      this.app.game.stage.addChild(this.pipe.pipeSpriteBottom);
      this.app.game.stage.addChild(this.pipe.pipeSpriteTop);
      this.app.game.stage.addChild(this.ground.tilingSpriteGround);
    },
    // установка позиций верхней и нижней трубы
    setPositionPipe() {
      this.pipe.pipeSpriteBottom.position.set(this.pipe.x, this.pipe.By);
      this.pipe.pipeSpriteTop.position.set(this.pipe.x, this.pipe.By - this.pipe.height - this.pipe.pipeDdistance);
    },
    // падение птицы (типо)
    gravitiBird() {
      if (this.bird.animatedSpray.rotation >= 1) {
        this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      } else {
        this.bird.animatedSpray.rotation += 0.02
      }
      this.bird.y += 2
    },
    // движение птицы при клике 
    moveBird() {
      // решил что код ниже не нужен так как ставлю поптицу в конкретное положениие так анимация плавнее
      // if (this.bird.animatedSpray.rotation <= - 0.6) {
      //   this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      // } else {
      //   this.bird.animatedSpray.rotation -= 0.6
      // }
      this.bird.animatedSpray.rotation = - 0.6
      this.bird.y -= 50
    },
    //  движение заднего фона
    moveBg() {
      this.tilingSpriteBG.tilePosition.x -= 1.2;
    },
    //  движение земли
    moveGround() {
      this.ground.tilingSpriteGround.tilePosition.x -= 2.2;
    },
    //  движение трубы
    movePipe() {
      this.pipe.Ty = this.pipe.By - this.pipe.height - this.pipe.pipeDdistance
      if (this.pipe.x <= -42) {
        this.pipe.x = 225
        this.pipe.By = this.randomHeight()
      }
      this.pipe.x -= 2
    },
    //  удар с верхней рубой 
    hitTopPipe() {
      // стороны птицы
      let birdTop = this.bird.y;
      let birdRight = this.bird.x + this.bird.animatedSpray.width;
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let birdLeft = this.bird.x;
      // стороны верхней трубы
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
    // удар об нижнюю трубу 
    hitBottomPipe() {
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
    },
    // удар с землёй
    hitGround() {
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let groundTop = this.ground.tilingSpriteGround.y
      if (birdBottom > groundTop) {
        console.log('столкновение с землёй');
      }
    },
    //  вылет за рамку
    climbsBorders() {
      let birdTop = this.bird.y;
      if (birdTop <= 0) {
        console.log('за рамкой ');
      }

    },

    setCounterStart() {
      this.counterStart += 1
      if (this.counterStart >= 1) {
        this.game = true
      }

    },
    // слушаем нажатия 
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.code === "Space") {
          this.game ? this.moveBird() : ''
          
        }
      })
    },
    //  рандомная высота трубы
    randomHeight() {
      return Math.round(Math.random() * (350 - 220) + 220)
    }
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 225px;
  height: 400px;
}
</style>
