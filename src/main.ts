import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { vImgFallback } from './directives/imgFallback'
import { useAuthStore } from './stores/auth'
import { initAnalytics } from './analytics'
// Self-hosted variable fonts (no third-party, render-blocking stylesheet).
import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/inter/wght.css'
import './styles/main.scss'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.directive('img-fallback', vImgFallback)

initAnalytics()

useAuthStore().refresh()

router.isReady().then(() => app.mount('#app'))
