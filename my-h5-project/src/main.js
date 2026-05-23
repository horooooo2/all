import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'amfe-flexible'
import 'vant/es/dialog/style'
import './styles/index.less'
import App from './App.vue'
import i18n from './i18n'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { initBrowserUiInset } from './utils/browser-ui-inset'

initBrowserUiInset()

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(i18n)
app.use(router)

app.mount('#app')
