<template>
  <div class="container">
    <div class="wrapper"></div>
  </div>
</template>

<script>
import { Container } from '@pixi/display';
import * as PIXI from 'pixi.js';
import birdUrl from './assets/img/bird.png';
import bgUrl from './assets/img/bg.png';
import groundURL from './assets/img/ground.png'
import pipeURL from './assets/img/pipe.png'

import charBirdImg1 from './assets/img/drags/fly-bird1.png';
import charBirdImg2 from './assets/img/drags/fly-bird2.png';
import charBirdImg3 from './assets/img/drags/fly-bird3.png';
import charBirdImg4 from './assets/img/drags/fly-bird4.png';
// import charBirdJson from './assets/spritesheet/spritesheet.json';

export default {
  data() {
    return {
      app: null, // приложение 
      bird: {
        alienImages: [charBirdImg1, charBirdImg2, charBirdImg3, charBirdImg4],
        animatedSpray: null, // анимированная анимация из 4х кадров
        textureArray: [],
        x: 30,
        y: 220,
        upCounter: 0,
      }, // птица 
      pipeTexture: null, //
      pipeSprite: null, //
      x: 30, //
      y: 220, //
      bgTexture: null, // бг
      groundTexture: null, //
      tilingSpriteBG: null, //
      tilingSpriteGround: null, //
      textureArray: [],
    };
  },

  created() { },
  mounted() {
    this.drawPixi();
    this.listener()

  },
  methods: {
    drawPixi() {
      let wrapper = document.querySelector('.wrapper'); // елемент со страницы где будем рендерить игру
      this.app = new PIXI.Application({ //?  новый екзенпляр пикси жс,  
        transparent: true,
        width: 225,
        height: 400,
        interactive: true,
        buttonMode: true,
      });

      wrapper.appendChild(this.app.view); // добавляем на страницу 

      this.renderSourse();
      this.stageAdd();

      for (let i = 0; i < this.bird.alienImages.length; i++) {
        let texture = PIXI.Texture.from(this.bird.alienImages[i]);
        this.bird.textureArray.push(texture);
      }

      this.bird.animatedSpray = new PIXI.AnimatedSprite(this.bird.textureArray);  // создание анимированного спрея на основе 4х картинок
      this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
      this.app.stage.addChild(this.bird.animatedSpray); // добавить аниммСПрей на сцену 
      this.bird.animatedSpray.animationSpeed = 0.1; // скорость анимации 
      this.bird.animatedSpray.rotation

      this.app.stage.interactive = true;


      this.app.stage.on('click', () => this.moveBird())
      this.bird.animatedSpray.play(); // запустить анимацию 


      this.app.ticker.add(() => { //ticker это обьект  пикси жс что запускает вызовы в каждом кадре реквест анимейшитн фрейм
        this.moveGround()
        this.moveBg();
        this.bird.animatedSpray.position.set(this.bird.x, this.bird.y);
        this.gravitiBird()
        this.setPositionPipe()
      });
    },
    renderSourse() {
      this.bgTexture = PIXI.Texture.from(bgUrl);
      this.pipeTexture = PIXI.Texture.from(pipeURL);
      this.pipeSprite = PIXI.Sprite.from(this.pipeTexture)
      this.groundTexture = PIXI.Texture.from(groundURL);

      this.tilingSpriteBG = new PIXI.TilingSprite(this.bgTexture, 225, 400);
      this.tilingSpriteGround = new PIXI.TilingSprite(this.groundTexture, 263, 86);
      this.tilingSpriteGround.position.set(-10, 350);
    },
    stageAdd() {
      this.app.stage.addChild(this.tilingSpriteBG);
      this.app.stage.addChild(this.pipeSprite);
      this.app.stage.addChild(this.tilingSpriteGround);
    },

    setPositionPipe() {
      this.pipeSprite.position.set(50, 150);
    },
    gravitiBird() {
      
      if (this.bird.animatedSpray.rotation >= 1) {
          this.bird.animatedSpray.rotation = this.bird.animatedSpray.rotation
      }  else {
        this.bird.animatedSpray.rotation += 0.01
      }
      this.bird.y += 2
    },
    moveBird() {
      if (this.bird.animatedSpray.rotation  <= -1 ){
        this.bird.animatedSpray.rotation = -0.9
      } else {
        this.bird.animatedSpray.rotation -= 0.3
      }
      this.bird.y -= 50
      
    },
    moveBg() {
      this.tilingSpriteBG.tilePosition.x -= 0.5;
    },
    moveGround() {
      this.tilingSpriteGround.tilePosition.x -= 0.8;
    },
    movePipe() {

    },
    listener() {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
          this.moveBird()
        }
      })
    }
  },
};
</script>

<style lang="scss" scoped></style>
