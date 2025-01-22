<script setup lang="ts">
import type { NotepadVisibility, SbsRecord } from '@antcde/connect-ts'
import { clone } from '@antcde/connect-ts'
import { onMounted, ref, watch } from 'vue'
import { injectComms } from './main.ts'

const { toolbar, notepad, context, connect, notifications, appState } = injectComms()
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

watch(() => context.value.project, project => console.log({ project: JSON.parse(JSON.stringify(project)) }))

const search = ref('')

onMounted(() => {
  toolbar.title.value = `Test App!`
  toolbar.menu.value = ['mdi-home-outline', 'mdi-cog-outline'].map((icon, index) => ({
    icon,
    title: `Item ${index + 1}`,
    onClick: () => console.debug(`Item ${index + 1} clicked`),
  }))

  toolbar.search.enabled.value = true
  toolbar.search.changes.subscribe(console.info)
})

function showTab(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = target?.value as NotepadVisibility

  notepad.show(value)
}

function showTask(e: Event) {
  const target = e.target as HTMLSelectElement
  const id = target?.value

  return notepad.showTask({ id })
}

function selectSbs(e: Event) {
  const target = e.target as HTMLSelectElement
  const code = target?.value

  notepad.selectSbs({ code })
}

function showNotepad() {
  notepad.show()
}

function hideNotepad() {
  notepad.hide()
}
</script>

<template>
  <div :style="{ padding: '50px' }">
    <h1>Test app!</h1>
    <button @click="notifications.success('This is amazing!')">
      Send notification
    </button>
    <button type="button" @click="count++">
      count is {{ count }}
    </button>

    <h2>Search</h2>

    {{ search }}

    <h2>Select SBS</h2>

    <select @change="selectSbs">
      <option v-for="item in sbs" :key="item.id" :value="item.code">
        {{ item.code }}
      </option>
    </select>

    <h2>Select Task</h2>

    <select @input="showTask">
      <option v-for="task in tasks" :key="task.id" :value="task.id">
        {{ task.title }}
      </option>
    </select>

    <h2>Notepad</h2>

    <select @change="showTab">
      <option v-for="item in ['task', 'apps', 'tasks', 'sbs']" :key="item" :value="item">
        {{ item }}
      </option>
    </select>
    <button type="button" @click="showNotepad">
      Open
    </button>
    <button type="button" @click="hideNotepad">
      Close
    </button>
  </div>
</template>
