<template>
  <div class="body515">
    <div id="container">
    </div>
    <div class='input-card'>
      <a :class="btnClass(true)" @click="isExistCurrentNode && handleAddNode()">
        <img v-show="isExistCurrentNode" src="@/assets/track/addNodeSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addNodeSmallGray.png" />添加节点
      </a>
      <a :class="btnClass(true)" @click="isExistCurrentNode && handleAddSpecialFee()">
        <img v-show="isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addSpecialFeeSmallGray.png" />添加特殊费
      </a>
      <a :class="btnClass(false)" @click="isExistCurrentNode && handleAddException()">
        <img v-show="isExistCurrentNode" src="@/assets/track/addExceptionSmallBlue.png" />
        <img v-show="!isExistCurrentNode" src="@/assets/track/addExceptionSmallGray.png" />添加异常
      </a>
      <el-button @click="handleEraseOverlays">清除地图覆盖物</el-button>
    </div>
    <div id="panel" hidden>
      <ul id="my-list"></ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnTheWayTrackMap',
  props: {
    dispatchBusinessEntity: {
      type: Object,
      default: () => {
        return null
      }
    }
  },
  data () {
    return {
      map: null,
      pathSimplifierIns: null,
      currentDispatch: null,
      currentWaybillTrailLngLats: [],
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
    this.currentDispatch = JSON.parse(JSON.stringify(this.dispatchBusinessEntity))
  },
  computed: {
    isExistCurrentNode () {
      return !!this.currentDispatchedWaybillId
    },
    isNeedToCallPainting () {
      return this.currentWaybillTrailLngLats.length > 0
    },
    isNeedToCallPlanning () {
      return this.currentWaybillTrailLngLats.length === 2
    },
    isExistCurrentDispatch () {
      return !!this.currentDispatch
    },
    currentDispatchedWaybillId () {
      return !!this.currentDispatch && this.currentDispatch.currentDispatchedWaybillId
    }
  },
  mounted () {
    this.initProcess(this)
  },
  watch: {
    // 处理调度单改变事件
    dispatchBusinessEntity (newVal) {
      this.handleDispatchChangeExternal(this, newVal)
    }
  },
  methods: {
    handleDispatchChangeExternal (context, newVal, isAlwaysUpdate) {
      const that = context
      console.log('dispatchBusinessEntity515', newVal, that.currentDispatch)
      if (!newVal) {
        that.handleEraseOverlays()
        const oldCurrentDispatchWaybillId = that.currentDispatchedWaybillId
        that.$http.post('/api/track/getAllWaybillLocations').then((res) => {
          console.log('getAllWaybillLocations》res515', res)
          const locations = res.body.data.locations
          !that.isExistCurrentDispatch && that.batchAddMarkers(that, locations, oldCurrentDispatchWaybillId, (context, locationBusinessEntity, SimpleMarker) => {
            const marker = new SimpleMarker(context.getMarkerOptions(context, locationBusinessEntity.longLatLocation, locationBusinessEntity.locationType, locationBusinessEntity.isTransitForLongLatLocation, locationBusinessEntity.isOperationToDelay, locationBusinessEntity.isOperationDelayed))
            // marker.setLabel(that.getMarkerLabelOptions(that.getMarkerLabelContent(locationBusinessEntity.locationType, false, locationBusinessEntity)))
            return [marker]
          })
        }, (err) => {
          console.log('err515', err)
        })
      }
      // 2. 赋值
      that.currentDispatch = JSON.parse(JSON.stringify(newVal))
      // 3. （根据变化情况，具体情况具体分析地）处理
      that.initProcess(that)
    },
    handleCurrentDispatchChange (context) {
      const that = context
      that.handleEraseOverlays()
      const oldCurrentDispatchWaybillId = that.currentDispatchedWaybillId
      if (that.isExistCurrentDispatch) {
        const dispatchedWaybills = that.currentDispatch.dispatchedWaybills
        console.log('dispatchedWaybills515', that.currentDispatch.dispatchedWaybills)
        const bRet = dispatchedWaybills && that.batchAddMarkers(that, dispatchedWaybills, oldCurrentDispatchWaybillId)
        bRet && that.initProcess(that)
      }
    },
    handleDispatchWaybillChange (context) {
      const that = context
      that.handleEraseOverlays(that)
      that.isExistCurrentNode && that.$http.post('/api/track/getLocationsByDispatchWaybillId').then((res) => {
        console.log('getLocationsByDispatchWaybillId》res515', res)
        const resData = res.body.data
        this.currentWaybillTrailLngLats = []
        // 求currentWaybillTrailLngLats的值
        const locations = resData && resData.locations
        if (locations && locations.length > 1) {
          if (resData.isArrived) {
            const walkedRoadLinePoints = []
            locations.forEach(locationBusinessEntity => {
              walkedRoadLinePoints.push({
                name: locationBusinessEntity.businessInfo.detailAddress,
                lnglat: locationBusinessEntity.longLatLocation,
                businessData: locationBusinessEntity
              })
            })
            this.currentWaybillTrailLngLats.push({
              name: '已走线路',
              points: walkedRoadLinePoints
            })
          } else {
            const walkedRoadLinePoints = []
            const toWalkRoadLinePoints = []
            locations.forEach((locationBusinessEntity, index) => {
              (index !== locations.length - 1) && walkedRoadLinePoints.push({
                name: locationBusinessEntity.businessInfo.detailAddress,
                lnglat: locationBusinessEntity.longLatLocation,
                businessData: locationBusinessEntity
              })
              if ((index === locations.length - 2) || (index === locations.length - 1)) {
                toWalkRoadLinePoints.push({
                  name: locationBusinessEntity.businessInfo.detailAddress,
                  lnglat: locationBusinessEntity.longLatLocation,
                  businessData: locationBusinessEntity
                })
              }
            })
            this.currentWaybillTrailLngLats.push({
              name: '已走线路',
              points: walkedRoadLinePoints
            })
            this.currentWaybillTrailLngLats.push({
              name: '未走线路',
              points: toWalkRoadLinePoints
            })
          }
        }
        console.log('this.currentWaybillTrailLngLats515', this.currentWaybillTrailLngLats)
        this.isNeedToCallPainting && this.paintingWalkedRoadLine()
        this.isNeedToCallPlanning && this.planningRoadLine()
      }, (err) => {
        console.log('getLocationsByDispatchWaybillId》err515', err)
      })
    },
    collectLocation (businessEntity, pointType, unValidCount) {
      let locationBusinessEntity = JSON.parse(JSON.stringify(businessEntity))
      const locationEntity = pointType === 1 ? {
        pointType: pointType,
        lnglat: locationBusinessEntity.startLocation,
        isTransit: locationBusinessEntity.isTransitForStartLocation,
        isToDelay: locationBusinessEntity.isDeliveryToDelay,
        isDelayed: locationBusinessEntity.isDeliveryDelayed
      } : {
        pointType: pointType,
        lnglat: locationBusinessEntity.endLocation,
        isTransit: locationBusinessEntity.isTransitForEndLocation,
        isToDelay: locationBusinessEntity.isArriveToDelay,
        isDelayed: locationBusinessEntity.isArriveDelayed
      }
      const isLocationValid = locationEntity.lnglat && locationEntity.lnglat.length === 2
      const retEntityObj = Object.assign(locationBusinessEntity, locationEntity)
      !isLocationValid && console.log('非法的起点位置经纬度：', retEntityObj, '非法序号：', ++unValidCount)
      // isLocationValid && retBEList.push(retEntityObj)
      return {
        isLocationValid: isLocationValid,
        retEntityObj: JSON.parse(JSON.stringify(retEntityObj))
      }
    },
    convertMarkerMatchedBEList (context, biLocationBusinessEntityList) {
      const retBEList = []
      if (biLocationBusinessEntityList && biLocationBusinessEntityList.length) {
        let unValidCount = 0
        for (let locationBusinessEntity of biLocationBusinessEntityList) {
          let ret = context.collectLocation(locationBusinessEntity, 1, unValidCount)
          ret.isLocationValid && retBEList.push(ret.retEntityObj)
          ret = context.collectLocation(locationBusinessEntity, 3, unValidCount)
          ret.isLocationValid && retBEList.push(ret.retEntityObj)
        }
      }
      return retBEList
    },
    batchAddMarkers (context, businessEntityList, oldCurrentDispatchWaybillId, processFn) {
      // 处理全部运单起止点
      if (processFn && businessEntityList) {
        window.AMapUI.loadUI(['overlay/SimpleMarker'], function (SimpleMarker) {
          let markers = []
          for (let locationBusinessEntity of businessEntityList) {
            const retMarkers = processFn(context, locationBusinessEntity, SimpleMarker)
            markers = [...markers, ...retMarkers]
            // 中途检查到当前调度运单发生变化
            if (oldCurrentDispatchWaybillId !== context.currentDispatchedWaybillId) {
              context.isExistCurrentNode && context.initProcess(context)
              if (!context.isExistCurrentNode) { // 只选中调度单（没有选中调度运单）时 需要放行
                // debugger
                // context.initProcess()
                continue
              }
              return false
            }
          }
          // 调整视野达到最佳显示区域
          context.map.setFitView(markers)
          return true
        })
      } else {
        const markerMatchedBusinessEntityList = context.convertMarkerMatchedBEList(context, businessEntityList)
        console.log('markerMatchedBusinessEntityList515', markerMatchedBusinessEntityList)
        const that = context
        window.AMapUI.loadUI(['misc/MarkerList', 'overlay/SimpleMarker'],
          function (MarkerList, SimpleMarker) {
            var markerList = new MarkerList({
              // 关联的map对象
              map: context.map,
              // 列表的dom容器的id
              listContainer: 'my-list',
              // 置空默认的选中行为，后续监听selectedChanged中处理
              onSelected: null,
              // 返回数据项的Id
              getDataId: function (dataItem, index) {
                // index表示该数据项在数组中的索引位置，从0开始，如果确实没有id，可以返回index代替
                return `${index}`
              },
              // 返回数据项的位置信息，需要是AMap.LngLat实例，或者是经纬度数组，比如[116.789806, 39.904989]
              getPosition: function (dataItem) {
                // console.log('dataItem515', dataItem)
                return dataItem.lnglat
              },
              // 返回数据项对应的Marker
              getMarker: function (dataItem, context, recycledMarker) {
                console.log('getMarker>dataItem515', dataItem)
                const pointType = dataItem.pointType
                const marker = new SimpleMarker(that.getMarkerOptions(that, dataItem.lnglat, pointType, dataItem.isTransit, dataItem.isToDelay, dataItem.isDelayed))
                marker.setLabel(that.getMarkerLabelOptions(that.getMarkerLabelContent(that, pointType, false, dataItem)))
                return marker
              }
            })
            // 监听选中改变
            markerList.on('selectedChanged', function (event, changedInfo) {
              // 重复选中，取消当前选中
              if (changedInfo.selectAgain) {
                this.clearSelected()
                return
              }
              var selectedRecord = changedInfo.selected
              // var selectedRecord = changedInfo.selected
              console.log('selectedRecord515', selectedRecord)
              if (selectedRecord) {
                const newDispatch = JSON.parse(JSON.stringify(context.currentDispatch))
                newDispatch.currentDispatchedWaybillId = selectedRecord.data.dispatchedWaybillId
                console.log('selectedRecord.data.dispatchedWaybillId515', selectedRecord.data.dispatchedWaybillId)
                console.log('context.currentDispatch.currentDispatchedWaybillIdd515', context.currentDispatch.currentDispatchedWaybillId)
                // context.handleDispatchChangeExternal(context, newDispatch, selectedRecord.data.dispatchedWaybillId === context.currentDispatch.currentDispatchedWaybillId)
                context.$emit('dispatchChange', newDispatch)
              }
            })
            // 展示该数据
            markerList.render(markerMatchedBusinessEntityList)
            // 调整视野达到最佳显示区域
            context.map.setFitView(markerList)
          })
      }
    },
    initProcess (that) {
      // 创建地图
      that.map = that.map || new window.AMap.Map('container', {
        zoom: 4
      })
      that.handleCurrentDispatchChange(that)
      that.handleDispatchWaybillChange(that)
    },
    handleAddNode () {
      console.log('this.currentDispatch,this.currentDispatch.currentDispatchedWaybillId515', this.currentDispatch, this.currentDispatch.currentDispatchedWaybillId)
      this.$message.warning('添加节点逻辑here!')
    },
    handleAddSpecialFee () {
      this.$message.warning('添加特殊费逻辑here!')
    },
    handleAddException () {
      this.$message.warning('添加异常逻辑here!')
    },
    getMarkerLabelOptions (content) {
      return {
        offset: new window.AMap.Pixel(0, 0),
        content: content, // 设置文本标注内容
        direction: 'top' // 设置文本标注方位
      }
    },
    displayInfoWindow (context, lnglat, businessData) {
      const content = []
      const contentStr = context.getMarkerLabelContent(context, businessData.locationType, true, businessData, true)
      content.push(contentStr)
      const infoWindow = new window.AMap.InfoWindow({
        isCustom: true, // 使用自定义窗体
        closeWhenClickMap: true,
        content: this.createInfoWindow('null', content.join('<br/>')),
        offset: new window.AMap.Pixel(16, -10)
      })
      infoWindow.open(context.map, lnglat)
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
          const point = info.pathData.points[info.pointIndex]
          that.displayInfoWindow(that, point.lnglat, point.businessData)
        })
      })
      !that.isNeedToCallPlanning && window.AMapUI.loadUI(['overlay/SimpleMarker'], function (SimpleMarker) {
        // that.drawRouteFromPath(that, that.currentWaybillTrailLngLats[0].points, SimpleMarker, 'solid')
        // 对于已送达的情况，绘制起止点图钉
        const startMarker = that.getCurrentStartMarker(that, SimpleMarker)
        const endMarker = that.getCurrentEndMarker(that, that.currentWaybillTrailLngLats[0].points, SimpleMarker)
        that.map.setFitView([startMarker, endMarker])
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
    getMarkerLabelContent (context, contentType, isCurrent, businessDataExternal, isNeedGetBusinessInfo) {
      const businessData = isNeedGetBusinessInfo ? businessDataExternal.businessInfo : businessDataExternal
      const currentClass = isCurrent ? 'labelCommon current' : 'labelCommon'
      switch (contentType) {
        case 1:
          return `<div id='${JSON.stringify(businessDataExternal)}' class='${currentClass}'><span>提货地址：${this.getFormatValue(businessData.sdAddress || businessData.detailAddress)}</span><br><span>要求提货时间：${this.getFormatValue(businessData.pickupTime)}</span><br><span>实际提货时间：${this.getFormatValue(businessData.actualPickupTime)}</span></div>`
        case 2:
          return `<div id='${JSON.stringify(businessDataExternal)}'  class='${currentClass}'><span>在途位置：${this.getFormatValue(businessData.detailAddress)}</span><br><span>提交人：${this.getFormatValue(businessData.createAccountName)}</span><br><span>提交时间：${this.getFormatValue(businessData.createDate)}</span><br><span>提交来源：${this.getFormatValue(businessData.sourceTypeName)}</span></div>`
        case 3:
          return `<div id='${JSON.stringify(businessDataExternal)}'  class='${currentClass}'><span>送达地址：${this.getFormatValue(businessData.rvAddress || businessData.detailAddress)}</span><br><span>要求送达时间：${this.getFormatValue(businessData.arrivalTime)}</span><br><span>实际送达时间：${this.getFormatValue(businessData.actualArriveDateTime)}</span></div>`
        default:
          alert('非法的内容类型！')
      }
    },
    getCurrentStartMarker (context, SimpleMarker) {
      const startPointLocation = context.currentWaybillTrailLngLats[0].points[0]
      const startPointBusinessData = startPointLocation.businessData
      const startMarker = new SimpleMarker(context.getMarkerOptions(context, startPointLocation.lnglat, 1, startPointBusinessData.isTransitForLongLatLocation, startPointBusinessData.isOperationToDelay, startPointBusinessData.isOperationDelayed))
      startMarker.setLabel(context.getMarkerLabelOptions(context.getMarkerLabelContent(context, 1, true, startPointBusinessData, true)))
      // context.addSelectEventListener(context, startMarker, startPointBusinessData)
      return startMarker
    },
    addSelectEventListener (context, targetMarker, businessData, isStart) {
      window.AMapUI.loadUI(['misc/MarkerList'],
        function (MarkerList) {
          var markerList = new MarkerList({
            // 关联的map对象
            map: context.map,
            // 列表的dom容器的id
            listContainer: 'my-list',
            // 置空默认的选中行为，后续监听selectedChanged中处理
            onSelected: null,
            // 返回数据项的Id
            getDataId: function (dataItem, index) {
              // index表示该数据项在数组中的索引位置，从0开始，如果确实没有id，可以返回index代替
              return JSON.stringify(dataItem)
            },
            // 返回数据项的位置信息，需要是AMap.LngLat实例，或者是经纬度数组，比如[116.789806, 39.904989]
            getPosition: function (dataItem) {
              // console.log('dataItem515', dataItem)
              return isStart ? dataItem.startLocation : dataItem.endLocation
            },
            // 返回数据项对应的Marker
            getMarker: function (dataItem, context, recycledMarker) {
              console.log('getMarker>dataItem515')
              return targetMarker
            }
          })
          // 监听选中改变
          markerList.on('selectedChanged', function (event, changedInfo) {
            // 重复选中，取消当前选中
            if (changedInfo.selectAgain) {
              this.clearSelected()
              return
            }
            var selectedRecord = changedInfo.selected
            // var selectedRecord = changedInfo.selected
            console.log('selectedRecord515', selectedRecord)
            if (selectedRecord) {
              const newDispatch = JSON.parse(JSON.stringify(context.currentDispatch))
              newDispatch.currentDispatchedWaybillId = selectedRecord.data.dispatchedWaybillId
              context.currentDispatch = newDispatch
              // console.log('selectedRecord.data.dispatchedWaybillId515', selectedRecord.data.dispatchedWaybillId)
              // console.log('context.currentDispatch.currentDispatchedWaybillIdd515', context.currentDispatch.currentDispatchedWaybillId)
              // context.handleDispatchChangeExternal(context, newDispatch, selectedRecord.data.dispatchedWaybillId === context.currentDispatch.currentDispatchedWaybillId)
            }
          })
          // 构建一个数据项数组，数据项本身没有格式要求，但需要支持下述的getDataId和getPosition
          var data = [businessData]
          // 展示该数据
          markerList.render(data)
        })
    },
    getCurrentEndMarker (context, path, SimpleMarker) {
      let points = []
      if (context.isNeedToCallPlanning) {
        points = context.currentWaybillTrailLngLats[1].points
      } else if (context.isNeedToCallPainting) {
        points = path
      }
      const point = points.length && points[points.length - 1]
      console.log('getCurrentEndMarker515', context.currentWaybillTrailLngLats, points, point)
      const endPointLocation = point && point.lnglat
      console.log('endPointLocation515', endPointLocation)
      const endPointBusinessData = point && point.businessData
      const endMarker = endPointBusinessData && new SimpleMarker(context.getMarkerOptions(context, endPointLocation, 3, endPointBusinessData.isTransitForLongLatLocation, endPointBusinessData.isOperationToDelay, endPointBusinessData.isOperationDelayed))
      endMarker && endMarker.setLabel(context.getMarkerLabelOptions(context.getMarkerLabelContent(context, 3, true, endPointBusinessData, true)))
      // endMarker && context.addSelectEventListener(context, endMarker, endPointBusinessData)
      return endMarker
    },
    drawRoute (route) {
      const that = this
      window.AMapUI.loadUI(['overlay/SimpleMarker'], function (SimpleMarker) {
        const path = that.parseRouteToPath(route)
        console.log('that.currentWaybillTrailLngLats515, path', that.currentWaybillTrailLngLats, path)
        that.drawRouteFromPath(that, path, SimpleMarker, 'dashed')
      })
    },
    drawRouteFromPath (context, path, SimpleMarker, strokeStyle) {
      const startMarker = context.getCurrentStartMarker(context, SimpleMarker)
      const endMarker = context.getCurrentEndMarker(context, path, SimpleMarker)
      const routeLine = new window.AMap.Polyline(context.polyLineOptions(path, strokeStyle))
      routeLine.setMap(context.map)
      // 调整视野达到最佳显示区域
      context.map.setFitView([startMarker, endMarker, routeLine])
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
    polyLineOptions (path, strokeStyle) {
      return {
        path: path,
        isOutline: true,
        outlineColor: '#ffeeee',
        borderWeight: 2,
        strokeWeight: 5,
        strokeColor: 'gray',
        lineJoin: 'round',
        lineWidth: 6,
        strokeStyle: strokeStyle,
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
    width: 1800px;
    height: 600px;
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
