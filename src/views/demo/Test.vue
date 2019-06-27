<template>
  <div id="container"></div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted () {
    // 创建地图
    var map = new AMap.Map('container', {
      zoom: 4
    })

    AMapUI.load(['ui/misc/PathSimplifier', 'lib/$', 'lib/utils'], function (PathSimplifier, $, utils) {
      if (!PathSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！')
        return
      }

      var pathSimplifierIns = new PathSimplifier({
        zIndex: 100,
        // autoSetFitView:false,
        map: map, // 所属的地图实例

        getPath: function (pathData, pathIndex) {
          var points = pathData.points
          var lnglatList = []
          console.log('pathData515', pathData, pathIndex)
          for (var i = 0, len = points.length; i < len; i++) {
            lnglatList.push(points[i].lnglat)
          }

          return lnglatList
        },
        getHoverTitle: function (pathData, pathIndex, pointIndex) {
          if (pointIndex >= 0) {
            // point
            return pathData.name + '，' + pathData.points[pointIndex].name
          }

          return pathData.name + '，点数量' + pathData.points.length
        },
        renderOptions: {
          renderAllPointsIfNumberBelow: -1, // 绘制路线节点，如不需要可设置为-1
          keyPointTolerance: 0,
          pathTolerance: 2,
          pathLineStyle: {
            lineWidth: 6,
            strokeStyle: 'gray',
            borderWidth: 1,
            borderStyle: '#cccccc',
            dirArrowStyle: false
          },
          pathLineHoverStyle: {
            lineWidth: 13,
            strokeStyle: 'rgba(204, 63, 88,1)',
            borderWidth: 1,
            borderStyle: '#ffffff',
            dirArrowStyle: false
          },
          pathLineSelectedStyle: {
            lineWidth: 6,
            strokeStyle: 'green',
            borderWidth: 1,
            borderStyle: '#cccccc',
            dirArrowStyle: true
          }
        }
      })

      window.pathSimplifierIns = pathSimplifierIns

      // 设置数据
      pathSimplifierIns.setData([{
        name: '已走线路',
        points: [{
          name: '点a',
          lnglat: [116.405289, 39.904987]
        }, {
          name: '点b',
          lnglat: [113.964458, 40.54664]
        }, {
          name: '点c',
          lnglat: [111.47836, 41.135964]
        }, {
          name: '点d',
          lnglat: [108.949297, 41.670904]
        }, {
          name: '点e',
          lnglat: [106.380111, 42.149509]
        }, {
          name: '点f',
          lnglat: [103.774185, 45.56996]
        }, {
          name: '点g',
          lnglat: [101.135432, 42.930601]
        }, {
          name: '点h',
          lnglat: [98.46826, 43.229964]
        }, {
          name: '点i',
          lnglat: [95.777529, 43.466798]
        }, {
          name: '点j',
          lnglat: [93.068486, 43.64009]
        }, {
          name: '点k',
          lnglat: [90.34669, 43.749086]
        } ]
      }, {
        name: '未走路线',
        points: [{
          name: '点k',
          lnglat: [90.34669, 43.749086]
        }, {
          name: '点l',
          lnglat: [87.61792, 44.793308]
        }]
      }])

      // 选中路线0
      pathSimplifierIns.setSelectedPathIndex(0)

      pathSimplifierIns.on('pointClick', function (e, info) {
        console.log('Click: ' + info.pathData.points[info.pointIndex].name)
      })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    #container {
        height: 1200px;
        width: 1200px;
    }
</style>
