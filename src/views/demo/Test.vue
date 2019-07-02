<template>
    <div>
       <on-the-way-track-map></on-the-way-track-map>
    </div>
</template>

<script>
import OnTheWayTrackMap from '@/components/OnTheWayTrackMap'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  components: {
    OnTheWayTrackMap
  },
  created () {
  },
  mounted () {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
