<script setup lang="ts">
import { computed } from 'vue'
import { Activity } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import type { LayoutMode } from '@/types'
import { percentValue } from '@/utils/format'
import { useFilteredGroups } from '@/composables/useFilteredGroups'
import GridToolbar from '@/components/common/GridToolbar.vue'
import DockerCard from './DockerCard.vue'
import DockerOverview from './DockerOverview.vue'

const configStore = useConfigStore()
const navStore = useNavStore()

const layout = computed<LayoutMode>(() => configStore.dockerLayout)
const dense = computed(() => layout.value === 'compact')

const { sections, visibleGroups, setSelection } = useFilteredGroups({
  items: () => navStore.allContainers,
  groups: () => navStore.dockerGroups,
  groupKeyOf: container => container.groupKey,
  match: (container, keyword) =>
    [container.containerName, container.displayName ?? '', container.description ?? '']
      .some(text => text.toLowerCase().includes(keyword))
})

const runningCount = computed(
  () => navStore.allContainers.filter(c => navStore.getContainerStats(c.containerName)?.state === 'running').length
)
const totalCpu = computed(() =>
  Array.from(navStore.dockerStats.values()).reduce((sum, stat) => sum + percentValue(stat.cpuPercent), 0)
)
</script>

<template>
  <section>
    <GridToolbar
      :groups="visibleGroups"
      :selection="configStore.currentGroup"
      :search="configStore.currentSearchKeyword"
      :layout="layout"
      placeholder="搜索容器…"
      @update:selection="setSelection"
      @update:search="configStore.setSearchKeyword"
      @update:layout="configStore.setDockerLayout"
    />

    <div class="glass mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 text-xs text-fg-muted">
      <span class="flex items-center gap-1"><Activity class="size-3.5 text-brand" />运行中 {{ runningCount }}/{{ navStore.allContainers.length }}</span>
      <span>合计 CPU {{ totalCpu.toFixed(1) }}%</span>
      <DockerOverview />
    </div>

    <template v-if="sections.length > 0">
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <h2 v-if="section.name" class="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
          {{ section.name }}
        </h2>
        <div class="auto-grid">
          <DockerCard
            v-for="container in section.items"
            :key="container.key"
            :container="container"
            :dense="dense"
            :show-description="configStore.showDescription"
          />
        </div>
      </div>
    </template>
    <p v-else class="glass px-4 py-10 text-center text-sm text-fg-subtle">没有匹配的容器</p>
  </section>
</template>
