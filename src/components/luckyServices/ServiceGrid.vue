<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import type { LayoutMode } from '@/types'
import { useFilteredGroups } from '@/composables/useFilteredGroups'
import GridToolbar from '@/components/common/GridToolbar.vue'
import ServiceCard from './ServiceCard.vue'

const configStore = useConfigStore()
const navStore = useNavStore()

const layout = computed<LayoutMode>(() => configStore.luckyServicesLayout)
const dense = computed(() => layout.value === 'compact')

const { sections, visibleGroups, setSelection } = useFilteredGroups({
  items: () => navStore.allLuckyServices,
  groups: () => navStore.luckyServicesGroups,
  groupKeyOf: service => service.groupKey,
  match: (service, keyword) =>
    [service.name, service.displayName ?? '', service.description ?? '', service.publicAddr ?? '']
      .some(text => text.toLowerCase().includes(keyword))
})
</script>

<template>
  <section>
    <GridToolbar
      :groups="visibleGroups"
      :selection="configStore.currentGroup"
      :search="configStore.currentSearchKeyword"
      :layout="layout"
      placeholder="搜索服务…"
      @update:selection="setSelection"
      @update:search="configStore.setSearchKeyword"
      @update:layout="configStore.setLuckyServicesLayout"
    />

    <template v-if="sections.length > 0">
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <h2 v-if="section.name" class="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
          {{ section.name }}
        </h2>
        <div class="auto-grid">
          <ServiceCard
            v-for="service in section.items"
            :key="service.key"
            :service="service"
            :dense="dense"
            :show-description="configStore.showDescription"
          />
        </div>
      </div>
    </template>
    <p v-else class="glass px-4 py-10 text-center text-sm text-fg-subtle">没有匹配的服务</p>
  </section>
</template>
