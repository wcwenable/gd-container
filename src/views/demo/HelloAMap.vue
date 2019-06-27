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
    AMapUI.loadUI(['overlay/SimpleMarker'], function (SimpleMarker) {
      var lngLats = getGridLngLats(map.getCenter(), 4, 4)

      let tempSm = new SimpleMarker({
      // 普通文本
        iconLabel: 'A',
        map: map,
        position: lngLats[0]
      })

      tempSm = new SimpleMarker({
        containerClassNames: 'my-marker',
        // 普通文本
        iconLabel: 'BC',

        iconStyle: 'green',

        map: map,
        position: lngLats[1]
      })

      tempSm = new SimpleMarker({

        // 设置节点属性
        iconLabel: {
          // 普通文本
          innerHTML: '转',
          // 设置样式
          style: {
            color: '#fff',
            fontSize: '120%',
            marginTop: '2px'
          }
        },

        iconStyle: 'red',
        map: map,
        position: lngLats[2]
      })

      tempSm = new SimpleMarker({
        iconLabel: {
          // html
          innerHTML: '<div class="my-blue-point"><img src="//webapi.amap.com/theme/v1.3/hotNew.png"/></div>'
        },
        iconStyle: 'black',
        map: map,
        position: lngLats[3]
      })
    })

    AMap.plugin(['AMap.ToolBar'], function () {
      map.addControl(new AMap.ToolBar({
        map: map
      }))
    })

    /**
     * 返回一批网格排列的经纬度

     * @param  {AMap.LngLat} center 网格中心
     * @param  {number} colNum 列数
     * @param  {number} size  总数
     * @param  {number} cellX  横向间距
     * @param  {number} cellY  竖向间距
     * @return {Array}  返回经纬度数组
     */
    function getGridLngLats (center, colNum, size, cellX, cellY) {
      var pxCenter = map.lnglatToPixel(center)

      var rowNum = Math.ceil(size / colNum)

      var startX = pxCenter.getX()
      var startY = pxCenter.getY()

      cellX = cellX || 70

      cellY = cellY || 70

      var lngLats = []

      for (var r = 0; r < rowNum; r++) {
        for (var c = 0; c < colNum; c++) {
          var x = startX + (c - (colNum - 1) / 2) * (cellX)

          var y = startY + (r - (rowNum - 1) / 2) * (cellY)

          lngLats.push(map.pixelToLngLat(new AMap.Pixel(x, y)))

          if (lngLats.length >= size) {
            break
          }
        }
      }
      return lngLats
    }
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
