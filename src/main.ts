import AntComponentLibrary, {useCommsInjection} from '@antcde/ant-component-library'
import {createApp} from 'vue'
import App from './App.vue'
import {vuetify} from './plugins/vuetify.ts'

const {injectComms, provideComms} = useCommsInjection()

createApp(App)
    .use(vuetify)
    .use(AntComponentLibrary)
    .use(provideComms)
    .mount('#app-1')

export {injectComms}