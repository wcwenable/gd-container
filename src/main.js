import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
/* 引入资源请求插件 */
import VueResource from 'vue-resource'

/* 使用VueResource插件 */
Vue.use(VueResource)

// require('./mock.js')

Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
