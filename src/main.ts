import 'core-js/actual/object/group-by'

import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import { router } from './router'
import { pinia } from '@/plugins/pinia'
import store from './store/index.js'
import { i18n } from './i18n'
import VueFormatters from './lib/formatters'
import packageJSON from '../package.json'
import { vuetify } from '@/plugins/vuetify'
import { registerGlobalComponents } from './plugins/layout'
import { longPressDirective } from '@/directives/longPress'
import '@/assets/styles/app.scss'

import 'dayjs/locale/de'
import 'dayjs/locale/en'
import 'dayjs/locale/fr'
import 'dayjs/locale/it'
import 'dayjs/locale/ru'

const app = createApp(App)

app.config.globalProperties.appVersion = packageJSON.version

app.use(router)
app.use(store)
app.use(pinia)
app.use(i18n)
app.use(vuetify)
app.use(VueQueryPlugin)
app.use(VueFormatters)
app.directive('longpress', longPressDirective)

registerGlobalComponents(app)

app.mount('#app')

window.ep = app

document.title = i18n.global.t('app_title')
