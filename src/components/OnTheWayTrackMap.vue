<template>
  <div class="body515">
    <div id="container">
    </div>
    <div class='input-card'>
      <a :class="btnClass(true)" @click="handleEraseOverlays">
        <img v-show="isExistCurrentNode" src="@/assets/track/addNodeSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addNodeSmallGray.png" />添加节点
      </a>
      <a :class="btnClass(true)" @click="handleEraseOverlays">
        <img v-show="isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallGray.png" />添加特殊费
      </a>
      <a :class="btnClass(false)" @click="handleEraseOverlays">
        <img v-show="isExistCurrentNode" src="@/assets/track/addExceptionSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addExceptionSmallGray.png" />添加异常
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnTheWayTrackMap',
  props: {
    msg: String
  },
  data () {
    return {
      map: null,
      pathSimplifierIns: null,
      currentDispatchedWaybillId: null,
      currentDispatch: null,
      currentWaybillTrailLngLats: [{
        name: '已走线路',
        points: [{
          name: '点a',
          businessData: {
            'wcw': 515
          },
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
      ],
      renderOptions: {
        renderAllPointsIfNumberBelow: 100, // 绘制路线节点，如不需要可设置为-1
        keyPointTolerance: 0,
        pathTolerance: 0,
        keyPointStyle: {
          radius: 3,
          fillStyle: 'rgba(8, 126, 196, 1)',
          lineWidth: 1,
          strokeStyle: '#eeeeee'
        },
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
    }
  },
  created () {
    console.log('res515', 515)
    this.$http.get('/api/track/getTrackDeliveryList').then((res) => {
      console.log('res515', res)
      this.currentDispatch = res.body.data[0]
      console.log('res.body.data515', res.body.data)
      const waybills = this.currentDispatch && this.currentDispatch.dispatchedWaybills
      if (waybills && waybills.length) {
        this.currentDispatchedWaybillId = waybills[0].dispatchedWaybillId
      }
      console.log('this.currentDispatchedWaybillId515', this.currentDispatchedWaybillId)
    }, (err) => {
      console.log('err515', err)
    })
  },
  computed: {
    isExistCurrentNode () {
      return this.currentDispatchedWaybillId !== null
    }
  },
  mounted () {
    // 创建地图
    this.map = new window.AMap.Map('container', {
      zoom: 4
    })
    this.paintingWalkedRoadLine()
    this.planningRoadLine()
  },
  methods: {
    getMarkerLabelOptions (content) {
      return {
        offset: new window.AMap.Pixel(0, 0),
        content: content, // 设置文本标注内容
        direction: 'top' // 设置文本标注方位
      }
    },
    displayInfoWindow (context, marker) {
      const content = []
      content.push("<div style='background-color: gray;'><img src='http://tpc.googlesyndication.com/simgad/5843493769827749134'>地址：北京市朝阳区阜通东大街6号院3号楼东北8.3公里")
      content.push('电话：010-64733333')
      content.push("<a href='https://ditu.amap.com/detail/B000A8URXB?citycode=110105'>详细信息</a></div>")
      const infoWindow = new window.AMap.InfoWindow({
        isCustom: true, // 使用自定义窗体
        closeWhenClickMap: false,
        content: this.createInfoWindow('null', content.join('<br/>')),
        offset: new window.AMap.Pixel(16, -45)
      })
      infoWindow.open(context.map, marker.getPosition())
    },
    createInfoWindow (title, content) {
      var info = document.createElement('div')
      info.className = 'custom-info input-card content-window-card'
      // 可以通过下面的方式修改自定义窗体的宽高
      // info.style.width = "400px";
      // 定义顶部标题
      var top = document.createElement('div')
      //  var titleD = document.createElement("div");
      // var closeX = document.createElement("img");
      top.className = 'info-top'
      // titleD.innerHTML = title;
      // closeX.src = "https://webapi.amap.com/images/close2.gif";
      // closeX.onclick = closeInfoWindow;
      // top.appendChild(titleD);
      //  top.appendChild(closeX);
      info.appendChild(top)
      // 定义中部内容
      var middle = document.createElement('div')
      middle.className = 'info-middle'
      middle.style.backgroundColor = 'white'
      middle.innerHTML = content
      info.appendChild(middle)
      // 定义底部内容
      var bottom = document.createElement('div')
      bottom.className = 'info-bottom'
      bottom.style.position = 'relative'
      bottom.style.top = '0px'
      bottom.style.margin = '0 auto'
      bottom.backgroundColor = 'black'
      var sharp = document.createElement('img')
      sharp.src = 'https://webapi.amap.com/images/sharp.png'
      bottom.appendChild(sharp)
      info.appendChild(bottom)
      return info
    },
    paintingWalkedRoadLine () {
      const that = this
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
            console.log('')
            if (pointIndex >= 0) {
              // point
              return pathData.name + '，' + pathData.points[pointIndex].name
            }
            return pathData.name + '，点数量' + pathData.points.length
          },
          renderOptions: that.renderOptions
        })
        // 设置数据
        that.pathSimplifierIns.setData([that.currentWaybillTrailLngLats[0]])
        // 选中路线0
        that.pathSimplifierIns.setSelectedPathIndex(0)
        that.pathSimplifierIns.on('pointClick', function (e, info) {
          console.log('Click: ' + info.pathData.points[info.pointIndex].name, info)
        })
      })
    },
    /**
       * pointType: (1: 起点，2：中间点，3：终点)
       * isTransitSite:(true:该位置是中转站，false:不是)
       * isToDelay:(true:是否即将延迟，false:不是)
       * isDelayed:(true:是否已经延迟，false:不是)
       */
    getMarkerOptions (context, location, pointType, isTransitSite, isToDelay, isDelayed) {
      let innerHTML = ''
      switch (pointType) {
        case 1:
          innerHTML = isTransitSite ? '转' : '起'
          break
        case 2:
          break
        case 3:
          innerHTML = isTransitSite ? '转' : '终'
          break
        default:
          return
      }
      const iconStyle = isToDelay ? 'orange' : isDelayed ? 'red' : 'green'
      if (pointType === 2) {
        return {
          position: location,
          icon: require('@/assets/track/middlePointSmallBlue.png'),
          map: context.map
        }
      } else {
        return {
          // 设置节点属性
          iconLabel: {
            // 普通文本
            innerHTML: innerHTML,
            // 设置样式
            style: {
              color: '#fff',
              fontSize: '120%',
              marginTop: '2px'
            }
          },
          iconStyle: iconStyle,
          map: context.map,
          position: location
        }
      }
    },
    btnClass (isNeedRightLine) {
      return {
        enabledBtn: this.isExistCurrentNode,
        disabledBtn: !this.isExistCurrentNode,
        rightLine: isNeedRightLine
      }
    },
    getFormatValue (fieldValue) {
      return fieldValue || ''
    },
    getMarkerLabelContent (contentType, isCurrent, businessData) {
      switch (contentType) {
        case 1:
          return `<div class="labelCommon current"><span>提货地址：${this.getFormatValue(businessData.sdAddress)}</span><br><span>要求提货时间：${this.getFormatValue(businessData.pickupTime)}</span><br><span>实际提货时间：${this.getFormatValue(businessData.actualPickupTime)}</span></div>`
        case 2:
          return `<div class="labelCommon current"><span>在途位置：${this.getFormatValue(businessData.detailAddress)}</span><span>提交人：${this.getFormatValue(businessData.createAccountName)}</span><br><span>提交时间：${this.getFormatValue(businessData.createDate)}</span><br><span>提交来源：${this.getFormatValue(businessData.sourceTypeName)}</span></div>`
        case 3:
          return `<div class="labelCommon current"><span>送达地址：${this.getFormatValue(businessData.rvAddress)}</span><br><span>要求送达时间：${this.getFormatValue(businessData.arrivalTime)}</span><br><span>实际送达时间：${this.getFormatValue(businessData.actualArriveDateTime)}</span></div>`
        default:
          alert('非法的内容类型！')
      }
    },
    drawRoute (route) {
      const that = this
      window.AMapUI.loadUI(['overlay/SimpleMarker'], function (SimpleMarker) {
        const path = that.parseRouteToPath(route)
        const startMarker = new SimpleMarker(that.getMarkerOptions(that, that.currentWaybillTrailLngLats[0].points[0].lnglat, 1, true, true, false))
        startMarker.setLabel(that.getMarkerLabelOptions(that.getMarkerLabelContent(1, true, {})))
        const endMarker = new SimpleMarker(that.getMarkerOptions(that, path[path.length - 1], 3, true, false, true))
        endMarker.setLabel(that.getMarkerLabelOptions(that.getMarkerLabelContent(3, true, {})))
        // that.displayInfoWindow(that, endMarker)
        // const middleMarker = new window.AMap.Marker(that.getMarkerOptions(that, [101.135432, 42.930601], 2, false, false, false))
        // that.displayInfoWindow(that, middleMarker)
        const routeLine = new window.AMap.Polyline(that.polyLineOptions(path))
        routeLine.setMap(that.map)
        // 调整视野达到最佳显示区域
        that.map.setFitView([startMarker, endMarker])
      })
    },
    // 解析DrivingRoute对象，构造成AMap.Polyline的path参数需要的格式
    // DrivingResult对象结构参考文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DriveRoute
    parseRouteToPath (route) {
      var path = []
      for (var i = 0, l = route.steps.length; i < l; i++) {
        var step = route.steps[i]
        for (var j = 0, n = step.path.length; j < n; j++) {
          path.push(step.path[j])
        }
      }
      return path
    },
    handleEraseOverlays () {
      console.log('handleEraseOverlays515', this.map, this.truckDriving)
      // 清除地图上所有添加的覆盖物
      this.map && this.map.clearMap()
      this.pathSimplifierIns && this.pathSimplifierIns.setData([])
    },
    polyLineOptions (path) {
      return {
        path: path,
        isOutline: true,
        outlineColor: '#ffeeee',
        borderWeight: 2,
        strokeWeight: 5,
        strokeColor: 'gray',
        lineJoin: 'round',
        lineWidth: 6,
        strokeStyle: 'dashed',
        icon: require('@/assets/track/middlePointSmallBlue.png')
      }
    },
    planningRoadLine () {
      const that = this
      const lnglats = that.currentWaybillTrailLngLats[1].points
      const truckDriving = new window.AMap.TruckDriving({
        policy: 0, // 规划策略
        size: 1 // 车型大小
      })
      const path = []
      lnglats && lnglats.length && lnglats.forEach(lnglatObj => {
        path.push({
          lnglat: lnglatObj.lnglat
        })
      })
      truckDriving.search(path, function (status, result) {
        // result即是对应的货车导航信息，相关数据结构文档请参考 https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
        if (status === 'complete') {
          that.$message.success('绘制货车路线完成')
          if (result.routes && result.routes.length) {
            that.drawRoute(result.routes[0])
          }
        } else {
          that.$message.error('获取货车规划数据失败：' + result)
        }
      })
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
    cursor: no-drop;
  }
  .enabledBtn {
    @include btn-common;
    color: rgba(24, 144, 255, 1);
    cursor: pointer;
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
  .content-window-card {
    position: relative;
    box-shadow: none;
    bottom: 0;
    left: 0;
    width: auto;
    padding: 0;
  }
  .content-window-card p {
    height: 2rem;
  }
  .custom-info {
    border: solid 1px silver;
  }
  div.info-top {
    position: relative;
    background: none repeat scroll 0 0 #F9F9F9;
    border-bottom: 1px solid #CCC;
    border-radius: 5px 5px 0 0;
  }
  div.info-top div {
    display: inline-block;
    color: #333333;
    font-size: 14px;
    font-weight: bold;
    line-height: 31px;
    padding: 0 10px;
  }
  div.info-top img {
    position: absolute;
    top: 10px;
    right: 10px;
    transition-duration: 0.25s;
  }
  div.info-top img:hover {
    box-shadow: 0px 0px 5px #000;
  }
  div.info-middle {
    font-size: 12px;
    padding: 10px 6px;
    line-height: 20px;
  }
  div.info-bottom {
    height: 0px;
    width: 100%;
    clear: both;
    text-align: center;
  }
  div.info-bottom img {
    position: relative;
    z-index: 104;
  }
  span {
    margin-left: 5px;
    font-size: 11px;
  }
  .info-middle img {
    float: left;
    margin-right: 6px;
  }
  #container div.amap-marker-label {
    // width: 188px;
    // height: 76px;
    background: transparent; // box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
    border: none;
  }
  .labelCommon {
    & span {
      display: inline-block;
      padding: 2px 0;
    }
    padding: 12px 8px;
    background-color:rgba(229, 229, 229, 1);
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15); // border: 1px solid rgba(0, 0, 0, 0.15);
  }
  .current {
    background-color: white;
  }
</style>
