<script setup lang="ts">
import type {NotepadVisibility, SbsRecord} from '@antcde/connect-ts'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {injectComms} from './main.ts'
import {objectPick} from '@vueuse/core/index.cjs';
import * as qs from 'qs'

const {toolbar, notepad, context, connect, notifications, appState, signal} = injectComms() // simple utility for communicating with the OS through your application. Just copy this line into the desired component
const count = ref(0)
const sbs = ref<SbsRecord[]>([])
const tasks = ref<{ id: string, title: string }[]>([])

appState.value = 'test 123' // you can store state in the URL for later usage.

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

watch(() => context.value.project, project => console.log({project: JSON.parse(JSON.stringify(project))}))

onMounted(() => {
  toolbar.title.value = `Test App!` // Setting the toolbar title will override the default value
  toolbar.menu.value = ['mdi-home-outline', 'mdi-cog-outline'].map((icon, index) => ({ // You can set and update menu items any time, including their click listeners.
    icon,
    title: `Item ${index + 1}`,
    onClick: () => console.info(`Item ${index + 1} clicked`),
  }))

  toolbar.searchEnabled.value = true // setting this to `true` will show a prompt in the OS's toolbar
})

watch(toolbar.search, console.info) // you will receive updates of changes to the value of the prompt. For some reason the ref-way is not working

let unsubscribeSignal: (() => void) | undefined

const query = ref<string>('')

onMounted(() => unsubscribeSignal = signal.receive((s) => {
  if (s.route?.query) {
    console.log(s.route.query)
    query.value = JSON.stringify(s.route.query)
  }
}))

onUnmounted(() => unsubscribeSignal?.())
</script>

<template>
  <v-app class="pa-8">
    <h1>Test app!</h1>
    <v-btn-group divided variant="outlined">
      <v-btn @click="notifications.success('This is amazing!')" text="Send notification"/>
      <v-btn type="button" @click="count++">count is {{ count }}</v-btn>
    </v-btn-group>

    <h2>Search</h2>
    {{ toolbar.search }}

    <h2>query params</h2>
    {{ query }}



    <v-form>
    <h2>Select SBS</h2>
      <v-select
          :items="sbs"
          :item-props="value => ({...value, value: value.id, title: value.code})"
          @update:model-value="notepad.selectSbs"
      />

    <h2>Select Task</h2>
      <v-select
          :items="tasks"
          :item-props="(value, i) => ({ ...value, value: value.id + i })"
          @update:model-value="notepad.showTask"
      />

      <h2>Notepad</h2>
      <v-select
          clearable
          :items="['task', 'apps', 'tasks', 'sbs'] as NotepadVisibility[]"
          @update:model-value="item => notepad.show(item ?? undefined)"
          @click:clear="notepad.hide"
      />

      <h2>Overlay</h2>
      <v-select
          :items="tasks"
          :item-props="value => ({ ...value, value: value.id })"
          @update:model-value="({ id}) => signal({overlay: {action: {id}}})"
      />
    </v-form>
  </v-app>
</template>
