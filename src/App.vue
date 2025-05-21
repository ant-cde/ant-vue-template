<script setup lang="ts">
import type {NotepadVisibility, SbsRecord} from '@antcde/connect-ts'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {objectPick} from '@vueuse/core/index.cjs';
import * as qs from 'qs'
import {injectContext} from "./main.ts";
import {useTheme} from "vuetify";
import {useAntColorMode} from "@antcde/vue-utils";

const {comms} = injectContext()
const colorMode = useAntColorMode(comms)
const {toolbar, notepad, context, connect, notifications, appState, signal} = comms// simple utility for communicating with the OS through your application. Just copy this line into the desired component
const count = ref(0)
const sbs = ref<SbsRecord[]>([])
const tasks = ref<{ id: string, title: string }[]>([])

appState.value = 'test 123' // you can store state in the URL for later usage.

const theme = useTheme();

watch(
    colorMode.isDark,
    isDark => theme.global.name.value = isDark ? 'dark' : 'light',
    {immediate: true}
)

watch(() => context.value.project, async (project) => {
  if (project?.id) {
    const flatten = (records: SbsRecord[]): SbsRecord[] => records.flatMap(r => [r].concat((r.children?.length ? flatten(r.children) : [])))
    const records = await connect.sbs.getSbs(project.id)

    sbs.value = flatten(records)
  }
})

watch(() => context.value.license, async (license) => {
  if (license) {
    tasks.value = await connect.tasks
        .getV2Tasks(license.id, qs.stringify({per_page: 3}))
        .then(e => e.data.map(t => objectPick(t, ['id', 'title'])))
  }
})

watch(count, count => toolbar.title.value = `Count: ${count}`)

onMounted(() => {
  toolbar.title.value = `Test App!` // Setting the toolbar title will override the default value
  toolbar.menu.value = ['mdi-home-outline', 'mdi-cog-outline'].map((icon, index) => ({ // You can set and update menu items any time, including their click listeners.
    icon,
    title: `Item ${index + 1}`,
    onClick: () => comms.notifications.info(`Item ${index + 1} clicked`),
  }))

  toolbar.searchEnabled.value = true // setting this to `true` will show a prompt in the OS's toolbar
})

let unsubscribeSignal: (() => void) | undefined

const query = ref<string>('')

onMounted(() => unsubscribeSignal = signal.receive((s) => {
  if (s.route?.query) query.value = JSON.stringify(s.route.query)
}))

onUnmounted(() => unsubscribeSignal?.())

const navigation = [
  {title: 'Dashboard', subtitle: 'OS.dash'},
  {title: 'Login', subtitle: 'OS.login'},
  {title: 'Profile', subtitle: 'OS.profile'},
  {title: 'ANT OS Store', subtitle: 'store'},
]
</script>

<template>
  <v-app class="pa-8">
    <h3>Test app!</h3>
    <p>Run your app and go to <a href="os.antcde.io/developer">ANT OS developer page</a>. By default it shows the app
      hosted on port 5174, but you can change it by going to /developer/:port.</p>
    <v-btn-group divided variant="outlined">
      <v-btn @click="notifications.success('This is amazing!')" text="Send notification"/>
      <v-btn type="button" @click="count++">count is {{ count }}</v-btn>
    </v-btn-group>

    <h4>Search</h4>
    <p>Type in the toolbar to receive the search input</p>
    <code>{{ toolbar.search }}</code>

    <h4>query params</h4>
    <p>Change the query params in the URL to receive them in the app</p>
    <code>{{ query }}</code>

    <v-form>
      <h4>Select SBS</h4>
      <p>Select an SBS item to be shown and highlighted in the notepad</p>
      <v-select
          density="compact"
          :items="sbs"
          :item-props="item => ({...item, value: item.code, title: item.code})"
          @update:model-value="code => notepad.show('sbs').then(() => notepad.selectSbs({ code }))"
      />

      <h4>Select Task</h4>
      <p>Select a task to be shown in the notepad</p>
      <v-select
          density="compact"
          :items="tasks"
          :item-props="(task) => ({ ...task, value: task.id  })"
          @update:model-value="id => notepad.showTask({ id })"
      />

      <h4>Notepad</h4>
      <p>Open a certain tab in the notepad</p>
      <v-select
          density="compact"
          clearable
          :items="['task', 'apps', 'tasks', 'sbs'] as NotepadVisibility[]"
          @update:model-value="item => notepad.show(item ?? undefined)"
          @click:clear="notepad.hide"
      />

      <h4>Overlay</h4>
      <p>Show the task as a workflow</p>
      <v-select
          density="compact"
          :items="tasks"
          :item-props="item => ({ ...item, value: item.id })"
          @update:model-value="(id) => signal({overlay: {action: {id}}})"
      />

      <h4>Navigate to</h4>
      <p>Open a specific page or other app through an app</p>
      <v-select
          density="compact"
          :items="navigation"
          :item-props="item => ({ ...item, value: item.subtitle })"
          @update:model-value="to => comms.signal({navigate: {to}})"/>
    </v-form>
  </v-app>
</template>
