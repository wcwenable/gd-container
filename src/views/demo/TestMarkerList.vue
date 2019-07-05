<template>
  <div class="hello">
    <div id="container">
    </div>
    <div id="panel" hidden>
      <ul id="my-list"></ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  created () {
  },
  mounted () {
    // 创建地图
    var map = new AMap.Map('container', {
      zoom: 9
    })

    AMapUI.loadUI(['misc/MarkerList', 'overlay/SvgMarker'],
      function (MarkerList, SvgMarker) {
        var markerList = new MarkerList({
          // 关联的map对象
          map: map,

          // 列表的dom容器的id
          listContainer: 'my-list',

          // 置空默认的选中行为，后续监听selectedChanged中处理
          onSelected: null,

          // 返回数据项的Id
          getDataId: function (dataItem, index) {
            // index表示该数据项在数组中的索引位置，从0开始，如果确实没有id，可以返回index代替
            return dataItem.id
          },
          // 返回数据项的位置信息，需要是AMap.LngLat实例，或者是经纬度数组，比如[116.789806, 39.904989]
          getPosition: function (dataItem) {
            return dataItem.position
          },
          // 返回数据项对应的Marker
          getMarker: function (dataItem, context, recycledMarker) {
            // marker的标注内容
            var content = '标注: ' + (context.index + 1) + ''

            var label = {
              offset: new AMap.Pixel(16, 18), // 修改label相对于marker的位置
              content: content
            }

            // 存在可回收利用的marker
            if (recycledMarker) {
              // 直接更新内容返回
              recycledMarker.setLabel(label)
              return recycledMarker
            }

            // 返回一个新的Marker
            return new AMap.Marker({
              label: label
            })
          }

        })

        // 创建一个SquarePin，显示在选中的Marker位置
        var svgMarker = new SvgMarker(
          new SvgMarker.Shape.SquarePin({
            height: 60,
            strokeWidth: 1,
            strokeColor: '#ccc',
            fillColor: 'purple'
          }), {
            containerClassNames: 'my-svg-marker',
            showPositionPoint: true
          })

        // 监听选中改变
        markerList.on('selectedChanged', function (event, changedInfo) {
          // 重复选中，取消当前选中
          if (changedInfo.selectAgain) {
            this.clearSelected()
            return
          }

          var selectedRecord = changedInfo.selected
          var unSelectedRecord = changedInfo.unSelected
          var marker

          if (selectedRecord) {
            marker = selectedRecord.marker
            marker.hide()

            svgMarker.setMap(marker.getMap())
            svgMarker.setPosition(marker.getPosition())
            svgMarker.setIconLabel(selectedRecord.id)
            svgMarker.show()
          } else {
            svgMarker.hide()
          }

          if (unSelectedRecord) {
            marker = unSelectedRecord.marker
            marker.show()
          }
        })

        // 构建一个数据项数组，数据项本身没有格式要求，但需要支持下述的getDataId和getPosition
        var data = [{
          id: 'A',
          position: [116.020764, 39.904989],
          desc: '数据_1'
        }, {
          id: 'B',
          position: [116.405285, 39.904989],
          desc: '数据_2'
        }, {
          id: 'C',
          position: [116.789806, 39.904989],
          desc: '数据_3'
        }]

        // 展示该数据
        markerList.render(data)
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  #container {
    width: 1600px;
    height: 800px;
  }
</style>
