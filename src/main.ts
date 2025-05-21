import AntComponentLibrary from '@antcde/component-library'
import {createApp} from 'vue'
import App from './App.vue'
import {vuetify} from './plugins/vuetify.ts'
import {UseCommsClient, useCommsClient, useSingleton} from "@antcde/vue-utils";

export interface Context {
    comms: UseCommsClient
}

const [provideContext, injectContext] = useSingleton<Context>(
    'appContext',
    () => ({comms: useCommsClient()}),
    ({comms}) => comms.unsubscribe(),
)


createApp(App)
    .use(provideContext)
    .use(vuetify)
    .use(AntComponentLibrary)
    .mount('#app-1')

export {injectContext}