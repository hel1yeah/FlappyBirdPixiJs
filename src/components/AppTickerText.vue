<template>
  <div class="ticker-text">
    <!-- <marquee 
      class="ticker-text__marquee" 
      behavior="scroll" 
      direction="left">
        Російський військовий корабель, іди нахуй
    </marquee> -->
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" >
.ticker-text {
  flex-shrink: 0;
  width: 100%;
  height: 5vh;
  background-color: red;
  background-image: url('./../assets/img/metal.webp');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  // font-family: "BF", sans-serif;
  font-weight: bold;
  display: flex;
  justify-content:center;
  align-items: center;
}
.ticker-text__marquee {
  font-weight: bold;
}

</style>