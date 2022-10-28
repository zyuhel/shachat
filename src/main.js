import 'core-js/features/array/flat-map'
import { PiniaSagaPlugin } from '@/pinia/saga'
// import { PiniaTestPlugin } from '@/pinia/saga/plugin'
import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import { createPinia, PiniaVuePlugin } from 'pinia'

import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import currencyFilter from './filters/currencyAmountWithSymbol'
import numberFormatFilter from './filters/numberFormat'
import VueFormatters from './lib/formatters'
import packageJSON from '../package.json'
import { vuetify } from '@/plugins/vuetify'
import './plugins/layout'
import './plugins/scrollTo'
import './registerServiceWorker'
import '@/assets/styles/app.scss'

import 'dayjs/locale/de'
import 'dayjs/locale/en'
import 'dayjs/locale/fr'
import 'dayjs/locale/it'
import 'dayjs/locale/ru'

export const vueBus = new Vue()

Vue.use(Vuetify)
Vue.use(VueFormatters)
Vue.use(PiniaVuePlugin)
const pinia = createPinia()
// pinia.use(PiniaTestPlugin)
pinia.use(PiniaSagaPlugin())

document.title = i18n.t('app_title')

Vue.config.productionTip = false
Vue.filter('currency', currencyFilter)
Vue.filter('numberFormat', numberFormatFilter)

window.ep = new Vue({
  version: packageJSON.version,
  vuetify,
  router,
  store,
  pinia,
  components: { App },
  template: '<App/>',
  i18n,
  render: h => h(App)
}).$mount('#app')
