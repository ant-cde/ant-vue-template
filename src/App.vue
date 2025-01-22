<script setup lang="ts">
import type {NotepadVisibility, SbsRecord} from '@antcde/connect-ts'
import {clone} from '@antcde/connect-ts'
import {onMounted, ref, watch} from 'vue'
import {injectComms} from './main.ts'

const {toolbar, notepad, context, connect, notifications, appState} = injectComms()
const count = ref(0)
const sbs = ref<SbsRecord[]>([])
const tasks = ref<{ id: string, title: string }[]>([])

appState.value = 'test 123'

watch(() => context.value.project, async (project) => {
  if (project?.id) {
    const flatten = (records: SbsRecord[]): SbsRecord[] => records.flatMap(r => [r].concat((r.children?.length ? flatten(r.children) : [])))
    const records = await connect.sbs.getSbs(project.id)

    sbs.value = flatten(records)
  }
})

watch(() => context.value.license, async (license) => {
  if (license) {
    const task = context.value.task
    if (task) {
      const t = await connect.tasks.getV2Task(task.id).then(e => e.data)
      tasks.value = [t, t, t]
      console.log('tasks', t, clone(tasks.value))
    }
  }
})

watch(count, count => toolbar.title.value = `Count: ${count}`)

watch(() => context.value.project, project => console.log({project: JSON.parse(JSON.stringify(project))}))

onMounted(() => {
  toolbar.title.value = `Test App!`
  toolbar.menu.value = ['mdi-home-outline', 'mdi-cog-outline'].map((icon, index) => ({
    icon,
    title: `Item ${index + 1}`,
    onClick: () => console.info(`Item ${index + 1} clicked`),
  }))

  toolbar.search.enabled.value = true
  toolbar.search.changes.subscribe(console.info)
})

</script>

<template>
  <v-app class="pa-8">
    <h1>Test app!</h1>
    <v-btn-group divided variant="outlined">
      <v-btn @click="notifications.success('This is amazing!')" text="Send notification"/>
      <v-btn type="button" @click="count++">count is {{ count }}</v-btn>
    </v-btn-group>


    <v-form>
    <h2>Select SBS</h2>
      <v-select
          :items="sbs"
          :item-props="value => ({value, title: value.code})"
          @update:model-value="notepad.selectSbs"
      />

    <h2>Select Task</h2>
      <v-select
          :items="tasks"
          :item-props="value => ({value, ...value})"
          @update:model-value="notepad.showTask"
      />

    <h2>Notepad</h2>
      <v-select
          clearable
          :items="['task', 'apps', 'tasks', 'sbs'] as NotepadVisibility[]"
          @update:model-value="item => notepad.show(item ?? undefined)"
          @click:clear="notepad.hide"
      />
    </v-form>
  </v-app>
</template>
