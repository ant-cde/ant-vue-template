import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import {defineConfig} from 'vite'
import {viteSingleFile} from 'vite-plugin-singlefile'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
    plugins: [
        vue(),
        vuetify(),
        Icons(),
        viteSingleFile({
            removeViteModuleLoader: true,
        }),
    ],
})
