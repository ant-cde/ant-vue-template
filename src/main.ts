import { useCommsInjection } from '@antcde/ant-component-library'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const { injectComms, provideComms } = useCommsInjection()

export { injectComms }

createApp(App)
  .use(provideComms)
  .mount('#app-1')
