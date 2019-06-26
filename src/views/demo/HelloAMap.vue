<template>
  <div class="hello">
   hello,时解之
    <div id="container"></div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted () {
    var map = new AMap.Map('container', {
      zoom: 11, // 级别
      center: [116.397428, 39.90923], // 中心点坐标
      viewMode: '3D'// 使用3D视图
    })
    console.log('Amap515', map)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#container{
  width:1600px;
  height: 800px;
}
</style>
