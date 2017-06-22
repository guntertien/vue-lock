import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import pwd from '@/components/pwd'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
      
    }
  ]
})
