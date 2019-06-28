<template>
    <div class="body515">

        <div id="container">

        </div>

        <div class='input-card'>
            <a :disabled="!isExistCurrentNode" :class="btnClass" @click="handleEraseOverlays">
              <img v-show="isExistCurrentNode" src="@/assets/track/addNodeSmallBlue.png" />
              <img v-show="!isExistCurrentNode" src="@/assets/track/addNodeSmallGray.png" />添加节点
            </a>

            <a :class="btnClass" @click="handleEraseOverlays">
              <img v-show="isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallBlue.png" />
              <img v-show="!isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallGray.png" />添加特殊费
            </a>

            <a :class="btnClass" @click="handleEraseOverlays">
              <img v-show="isExistCurrentNode" src="@/assets/track/addExceptionSmallBlue.png" />
              <img v-show="!isExistCurrentNode" src="@/assets/track/addExceptionSmallGray.png" />添加异常
            </a>
        </div>

    </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      map: null,
      pathSimplifierIns: null,
      lnglatsData: [{
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
        }]
      },
      {
        name: '未走路线',
        points: [{
          name: '点k',
          lnglat: [90.34669, 43.749086]
        }, {
          name: '点l',
          lnglat: [87.61792, 44.793308]
        }]
      }
      ]
    }
  },
  computed: {
    isExistCurrentNode () {
      return false
    },
    btnClass () {
      return {
        enabledBtn: this.isExistCurrentNode,
        disabledBtn: !this.isExistCurrentNode,
        rightLine: true
      }
    }
  },
  mounted () {
    const that = this
    // 创建地图
    this.map = new window.AMap.Map('container', {
      zoom: 4
    })
    window.AMapUI.load(['ui/misc/PathSimplifier', 'lib/$'], function (PathSimplifier, $) {
      if (!PathSimplifier.supportCanvas) {
        alert('当前环境不支持 Canvas！')
        return
      }

      that.pathSimplifierIns = that.pathSimplifierIns || new PathSimplifier({
        zIndex: 100,
        // autoSetFitView:false,
        map: that.map, // 所属的地图实例

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

      // 设置数据
      that.pathSimplifierIns.setData([that.lnglatsData[0]])

      // 选中路线0
      that.pathSimplifierIns.setSelectedPathIndex(0)

      that.pathSimplifierIns.on('pointClick', function (e, info) {
        console.log('Click: ' + info.pathData.points[info.pointIndex].name)
      })
    })
    this.planningRoadLine()
  },
  methods: {
    handleEraseOverlays () {
      console.log('handleEraseOverlays515', this.map, this.truckDriving)
      // 清除地图上所有添加的覆盖物
      this.map && this.map.clearMap()
      this.pathSimplifierIns && this.pathSimplifierIns.setData([])
    },
    planningRoadLine () {
      const that = this
      const lnglats = that.lnglatsData[1].points

      var truckDriving = new window.AMap.TruckDriving({
        policy: 0, // 规划策略
        size: 1 // 车型大小
      })

      var path = []
      // path.push({ lnglat: [116.303843, 39.983412] })// 起点
      // path.push({ lnglat: [116.407012, 39.992093] })// 终点

      lnglats && lnglats.length && lnglats.forEach(lnglatObj => {
        path.push({
          lnglat: lnglatObj.lnglat
        })
      })

      truckDriving.search(path, function (status, result) {
        // result即是对应的货车导航信息，相关数据结构文档请参考 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          // that.$message.success('绘制货车路线完成')

          if (result.routes && result.routes.length) {
            drawRoute(result.routes[0])
          }
        } else {
          // that.$message.error('获取货车规划数据失败：' + result)
        }
      })

      function drawRoute (route) {
        var path = parseRouteToPath(route)

        var startMarker = new window.AMap.Marker({
          position: that.lnglatsData[0].points[0].lnglat,
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
          map: that.map
        })

        var endMarker = new window.AMap.Marker({
          position: path[path.length - 1],
          icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
          map: that.map
        })

        var routeLine = new window.AMap.Polyline({
          path: path,
          isOutline: true,
          outlineColor: '#ffeeee',
          borderWeight: 2,
          strokeWeight: 5,
          strokeColor: 'gray',
          lineJoin: 'round',
          lineWidth: 6,
          strokeStyle: 'dashed'
        })

        routeLine.setMap(that.map)

        // 调整视野达到最佳显示区域
        that.map.setFitView([startMarker, endMarker])
      }

      // 解析DrivingRoute对象，构造成AMap.Polyline的path参数需要的格式
      // DrivingResult对象结构参考文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DriveRoute
      function parseRouteToPath (route) {
        var path = []

        for (var i = 0, l = route.steps.length; i < l; i++) {
          var step = route.steps[i]

          for (var j = 0, n = step.path.length; j < n; j++) {
            path.push(step.path[j])
          }
        }

        return path
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
/* * {
    margin: 0;
    padding: 0;
} */

.body515 {
    position: relative;
    width: 1300px;
    height: 1000px;
    border: 1px solid green;
}

#container {
    height: 100%;
}

.input-card {
    position: absolute;
    top: 0;
    right: 0;
    margin: 5px;
    padding: 10px;
    border: none;
    z-index: 100;
    width: auto;
    height: auto;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.3);
    border-radius: 4px;
}

@mixin btn-common {
    width: auto;
    height: 17px;
    font-size: 12px;
    font-family: PingFang-SC-Medium;
    font-weight: 500;
    line-height: 17px;
    padding: 0 5px;
}

.disabledBtn {
    @include btn-common;
    color: rgba(0, 0, 0, 0.65);
}

.enabledBtn {
    @include btn-common;
    color: rgba(24, 144, 255, 1);
}

.rightLine {
    border-right: 1px dashed #CCCCCC;
}

.line {
    height: 17px;
    margin-top: 1px;
    border-top-style: dashed;
    border-top-color: #CCCCCC;
}

img {
    vertical-align: middle;
    margin: 0 5px;
    padding-bottom: 3px;
}
</style>
