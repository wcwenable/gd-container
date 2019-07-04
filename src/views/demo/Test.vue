<template>
    <div>
       <el-button @click="handleBtnClick">换一个</el-button>
       <el-button @click="handleResetBtnClick">清空</el-button>
       <on-the-way-track-map :dispatchBusinessEntity='currentDispatch' :dispatchWaybillId='currentDispatchedWaybillId'></on-the-way-track-map>
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
      currentDispatchedWaybillId: null,
      currentDispatch: null
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
          this.currentDispatchedWaybillId = waybills[0].dispatchedWaybillId
        }
        console.log('this.currentDispatchedWaybillId515', this.currentDispatchedWaybillId)
      }, (err) => {
        console.log('getTrackDeliveryList》err515', err)
      })
    },
    handleResetBtnClick () {
      // this.currentDispatch = null
      this.currentDispatchedWaybillId = null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
