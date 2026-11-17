<script setup lang="ts">
import { computed } from 'vue'
import { Moon, Settings, Sun } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import ContentTabs from './ContentTabs.vue'
import GreetingClock from './GreetingClock.vue'

const configStore = useConfigStore()
const navStore = useNavStore()

const title = computed(() => navStore.panelTitle)
const subtitle = computed(() => navStore.panelSubtitle)
const logo = computed(() => {
  const raw = navStore.panelLogo
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `./backend/iconlibs/${raw}`
})

const isDark = computed(() => configStore.theme === 'dark')
</script>

<template>
  <header class="mb-4 flex flex-wrap items-center gap-3">
    <img v-if="logo" :src="logo" alt="" class="size-9 rounded-[var(--radius-sm)] object-contain" />
    <div class="min-w-0">
      <h1 class="truncate text-lg leading-tight font-semibold text-fg">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs text-fg-subtle">{{ subtitle }}</p>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <GreetingClock v-if="configStore.showTime" class="hidden sm:inline-flex" />
      <ContentTabs />
      <button
        type="button"
        class="glass grid size-8 place-items-center text-fg-muted hover:text-fg"
        :aria-label="isDark ? '切换到浅色主题' : '切换到深色主题'"
        @click="configStore.setTheme(isDark ? 'light' : 'dark')"
      >
        <Sun v-if="isDark" class="size-4" />
        <Moon v-else class="size-4" />
      </button>
      <button
        type="button"
        class="glass grid size-8 place-items-center text-fg-muted hover:text-fg"
        aria-label="打开设置"
        @click="configStore.toggleSettingsPanel()"
      >
        <Settings class="size-4" />
      </button>
    </div>
  </header>
</template>
