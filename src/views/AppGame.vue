<template>
  <div class="wrapper"></div>
</template>

<script>

import * as PIXI from 'pixi.js';
import bgUrl from './../assets/img/bg.png';

import groundURL from './../assets/img/ground.png'
import pipeBottomURL from './../assets/img/pipe-bottom.png'
import pipeTopURL from './../assets/img/pipe-top.png'
import clueTapURL from './../assets/img/clue-tap.png'

import charBirdImg1 from './../assets/img/drags/fly-bird1.png';
import charBirdImg2 from './../assets/img/drags/fly-bird2.png';
import charBirdImg3 from './../assets/img/drags/fly-bird3.png';


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
      clue: {
        textureClue: null,
        spriteClue: null,
        x: 82,
        y: 220,
      },
      scoreText: {
        style: null,
        text: '0',
        score: 0,
        x: 100,
        y: 30,
      },
      bgTexture: null, // бг
      tilingSpriteBG: null, //
      countSin: 0,
      jumping: 0,
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
        if (!this.gameFinish) {
          if (!this.gameStart) {
            this.start()
          } else {
            // this.moveBird()
            this.jumping = 8
          }
        }
      })
      this.app.game.stage.on('touched', () => {
        if (!this.gameFinish) {
          if (!this.gameStart) {
            this.start()
          } else {
            // this.moveBird()
            this.jumping = 8
          }
        }
      })

      wrapper.appendChild(this.app.game.view); // показывем на страницуе 
      this.app.game.stage.interactive = true;

      this.addText() //добавление на сцену текста 
      this.renderSourse(); // загрузка всех картинок 
      this.stageAdd(); // добавление на сцену текстур
      this.setPositionPipe() // установка и размещение труб
      this.setPositionClue()
      this.setPositionScoreText()

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.bird.alienImages[i]);
        this.bird.textureArray.push(texture);
      }

      this.createdAnimatedSprite()


      this.app.game.ticker.add(() => { //ticker это обьект  пикси жс что запускает вызовы в каждом кадре реквест анимейшитн фрейм
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
    // загрузка всех картинок 
    renderSourse() {
      this.bgTexture = PIXI.Texture.from(bgUrl);
      this.pipe.pipeTextureBottom = PIXI.Texture.from(pipeBottomURL);
      this.pipe.pipeSpriteBottom = PIXI.Sprite.from(this.pipe.pipeTextureBottom)
      this.pipe.pipeTextureTop = PIXI.Texture.from(pipeTopURL);
      this.pipe.pipeSpriteTop = PIXI.Sprite.from(this.pipe.pipeTextureTop)
      this.ground.groundTexture = PIXI.Texture.from(groundURL);

      this.clue.textureClue = PIXI.Texture.from(clueTapURL)
      this.clue.spriteClue = PIXI.Sprite.from(this.clue.textureClue)



      this.tilingSpriteBG = new PIXI.TilingSprite(this.bgTexture, 225, 400);
      this.ground.tilingSpriteGround = new PIXI.TilingSprite(this.ground.groundTexture, 263, 86);
      this.ground.tilingSpriteGround.position.set(this.ground.x, this.ground.y);
    },
    createdAnimatedSprite() {
      this.bird.animatedSpray = new PIXI.AnimatedSprite(this.bird.textureArray);  // создание анимированного спрея на основе 4х картинок
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.app.game.stage.addChild(this.bird.animatedSpray); // добавить аниммСПрей на сцену 
      this.bird.animatedSpray.animationSpeed = 0.12; // скорость анимации 
      this.bird.animatedSpray.rotation
      // this.bird.animatedSpray.anchor.set(0.5) '// установить центер спайта
      this.bird.animatedSpray.width = 27
      this.bird.animatedSpray.height = 19

      this.bird.animatedSpray.scale.x = 1
      this.bird.animatedSpray.scale.y = 1
      this.bird.animatedSpray.play(); // запустить анимацию 
    },
    addText() {
      this.scoreText.text = new PIXI.Text(this.scoreText.text,
        {
          fontFamily: 'BF',
          fontSize: 30,
          fontWeight: 'bold',
          fill: ['#ffffff'],
          stroke: '#000',
          strokeThickness: 5,
        }
      );
    },
    stageAdd() {
      // добавление на сцену 
      this.app.game.stage.addChild(this.tilingSpriteBG);
      this.app.game.stage.addChild(this.pipe.pipeSpriteBottom);
      this.app.game.stage.addChild(this.pipe.pipeSpriteTop);
      this.app.game.stage.addChild(this.ground.tilingSpriteGround);
      this.app.game.stage.addChild(this.clue.spriteClue);

      this.app.game.stage.addChild(this.scoreText.text) // добавление текста 
    },
    // установка позиций верхней и нижней трубы
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
    // падение птицы 
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
      this.bird.animatedSpray.rotation = - 0.6
      this.bird.y -= 10
      this.jumping += 8
    },
    //  когда конец игры то закрутить птицу и увеличть 
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

      if (this.pipe.x < this.bird.x && this.pipe.x > this.bird.x - 2) {
        this.setScoreText()
      }

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
        this.finish()
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
        this.finish()
      }
    },
    // удар с землёй
    hitGround() {
      let birdBottom = this.bird.y + this.bird.animatedSpray.height;
      let groundTop = this.ground.tilingSpriteGround.y
      if (birdBottom > groundTop) {
        console.log('столкновение с землёй');
        this.finish()
      }
    },
    //  вылет за рамку
    climbsBorders() {
      let birdTop = this.bird.y;
      if (birdTop <= 0) {
        console.log('за рамкой ');
      }

    },

    start() {
      this.gameStart = !this.gameStart
      this.app.game.stage.removeChild(this.clue.spriteClue);
    },
    finish() {
      this.gameStart = !this.gameStart
      this.gameFinish = true
      this.$store.dispatch('setScore', this.scoreText.score)

      this.$router.push({ name: 'gameover' })
    },
    chekGame() {
      if (!this.gameStart) {
        this.start()
      } else {
        this.moveBird()
      }
    },
    // слушаем нажатия 
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.code === "Space") {
          this.chekGame()
        }
      })
      window.addEventListener('touchend', (e) => {
        this.chekGame()
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
  flex-grow: 1;
  width: 225px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content:center;
}
</style>
