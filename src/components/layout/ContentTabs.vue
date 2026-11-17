<script setup lang="ts">
import { computed } from 'vue'
import { Globe, Container, Server } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import type { TabType } from '@/types'

const configStore = useConfigStore()
const navStore = useNavStore()

const tabs = computed<{ id: TabType; label: string; icon: typeof Globe }[]>(() => {
  const list: { id: TabType; label: string; icon: typeof Globe }[] = []
  if (navStore.sitesEnabled) list.push({ id: 'sites', label: '站点', icon: Globe })
  if (navStore.dockerEnabled) list.push({ id: 'docker', label: 'Docker', icon: Container })
  if (navStore.luckyServicesEnabled) list.push({ id: 'luckyServices', label: 'Lucky', icon: Server })
  return list
})
</script>

<template>
  <div v-if="tabs.length > 1" class="glass flex items-center gap-0.5 p-0.5">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      class="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-xs transition-colors"
      :class="tab.id === configStore.currentTab ? 'bg-brand/15 text-brand' : 'text-fg-muted hover:text-fg'"
      :aria-current="tab.id === configStore.currentTab ? 'page' : undefined"
      @click="configStore.setCurrentTab(tab.id)"
    >
      <component :is="tab.icon" class="size-3.5" />
      {{ tab.label }}
    </button>
  </div>
</template>
