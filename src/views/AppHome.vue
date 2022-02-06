<template>
  <div class="home">
    <div class="home__logo-anim">
      <div class="home__logo-wrapper">
        <img class="home__logo-wrapper-img" src="./../assets/img/flappy.png" alt="flappy-text" />
        <img class="home__logo-wrapper-img" src="./../assets/img/bird-l.png" alt="bird-text" />
      </div>
      <img class="home__logo-anim-img" src="./../assets/img/bird.png" alt="bird-text" />
    </div>
    <button class="home__logo-button" @click="startGame">
      <img class="home__logo-button-img" src="./../assets/img/start.png" alt="bird-text" />
    </button>
  </div>
</template>

<script>

export default {
  name: "Home",
  data() {
    return {

    }
  },
  mounted() {

  },
  methods:{
    startGame(){
      this.$router.push( {name: 'game'} )
    }
  
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
  &:hover{
    transform: translateY(-10px) ;
    
  }
}
.home__logo-button-img {
}
</style>