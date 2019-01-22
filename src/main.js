import Vue from 'vue'
import 'core-js/modules/es6.promise'

import './style/style.scss'
import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'

// import VueNativeSock from 'vue-native-websocket'
import router from './router'
import MainLayout from './layouts/MainLayout'
import store from './store'

import VueAuthenticate from 'vue-authenticate'
import authConfig from '../config/secrets/auth'

Vue.use(VueAuthenticate, {
  tokenName: 'access_token',
  baseUrl: 'http://localhost:3000',
  storageType: 'cookieStorage',
  providers: {
    authConfig
  }
})

Vue.use(Vuetify)

/*
Vue.use(
  VueNativeSock,
  'ws://localhost:3001',
  {
    store: store,
    reconnection: true
  }
)
*/

// register frequently used and nested components

/* eslint-disable no-new */
new Vue({
  el: '#root',
  data: {},
  router,
  store,
  template: '<main-layout/>',
  components: {
    MainLayout
  }
})

if (__DEV__) {
  // Remove productionTip
  Vue.config.productionTip = false
}
