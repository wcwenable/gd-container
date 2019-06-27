
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [{
    path: '/',
    name: 'hello',
    component: () => import('@/components/HelloWorld')
  }, {
    path: '/helloGd',
    name: 'helloGd',
    component: () => import('@/views/demo/HelloAMap')
  }, {
    path: '/test',
    name: 'test',
    component: () => import('@/views/demo/Test')
  }]
})
