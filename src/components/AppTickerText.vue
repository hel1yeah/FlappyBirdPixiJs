<template>
  <div class="ticker-text">
    <marquee class="ticker-text__marquee" behavior="scroll" direction="left">
      <span class="gradient-text">Російський військовий корабель, іди нахуй</span>
    </marquee>
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
  background-color: black;
  color: rgb(235, 42, 42);
  background-image: url("./../assets/img/footer.png");
  background-size: contain;
  background-repeat: repeat;
  background-position: center center;

  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}
.ticker-text__marquee {
}
.gradient-text {
  font-size: 30px;
  background: linear-gradient(0deg, rgb(242, 246, 0) 50%, rgb(66, 57, 216) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: #0b2349;
  font-weight: bold;
  display: table;
  margin: 20px auto;
}
</style>