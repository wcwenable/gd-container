<template>
    <div>
       <el-button @click="handleBtnClick">换一个</el-button>
       <el-button @click="handleResetBtnClick">清空</el-button>
       <on-the-way-track-map :dispatchBusinessEntity='currentDispatch'></on-the-way-track-map>
    </div>
</template>

<script>
import OnTheWayTrackMap from '@/components/OnTheWayTrackMap'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      // currentDispatchedWaybillId: null,
      currentDispatch: {
        currentDispatchedWaybillId: null
      }
    }
  },
  components: {
    OnTheWayTrackMap
  },
  created () {
    this.handleBtnClick()
  },
  mounted () {},
  methods: {
    handleBtnClick () {
      console.log('res515', 515)
      this.$http.get('/api/track/getTrackDeliveryList').then((res) => {
        console.log('getTrackDeliveryList》res515', res)
        this.currentDispatch = res.body.data[0]
        console.log('res.body.data515', res.body.data)
        const waybills = this.currentDispatch && this.currentDispatch.dispatchedWaybills
        if (waybills && waybills.length) {
          this.currentDispatch.currentDispatchedWaybillId = waybills[0].dispatchedWaybillId
        }
        console.log('this.currentDispatch515', this.currentDispatch)
      }, (err) => {
        console.log('getTrackDeliveryList》err515', err)
      })
    },
    handleResetBtnClick () {
      // 测试 当前选中调度单的情况
      // const dispatchedWaybills = this.currentDispatch.dispatchedWaybills
      // const randomIndex = Math.round(Math.random() * dispatchedWaybills.length)
      // console.log('Math.random(dispatchedWaybills.length)515', randomIndex, dispatchedWaybills)
      // this.currentDispatch.currentDispatchedWaybillId = dispatchedWaybills[randomIndex].dispatchedWaybillId
      // this.currentDispatch = JSON.parse(JSON.stringify(this.currentDispatch))

      // 测试 只选中调度单没有选中调度运单的情况
      this.currentDispatch.currentDispatchedWaybillId = null
      this.currentDispatch = JSON.parse(JSON.stringify(this.currentDispatch))

      // 测试 当前没有选中调度单或调度运单 的情况
      // this.currentDispatch = null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
