<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import { getEffectiveNetworkType } from '@/utils/siteLinks'
import { useFilteredGroups } from '@/composables/useFilteredGroups'
import type { LayoutMode } from '@/types'
import GridToolbar from '@/components/common/GridToolbar.vue'
import SiteCard from './SiteCard.vue'

const configStore = useConfigStore()
const navStore = useNavStore()

const layout = computed<LayoutMode>(() => configStore.layout)
const effectiveType = computed(() =>
  getEffectiveNetworkType(configStore.networkMode, navStore.networkType, navStore.networkTypeFetchFailed)
)

const { sections, visibleGroups, setSelection } = useFilteredGroups({
  items: () => navStore.allSites,
  groups: () => navStore.siteGroups,
  groupKeyOf: site => site.groupKey,
  match: (site, keyword) =>
    [site.name, site.description ?? '', ...(site.frontendUrls ?? []), ...(site.backendUrls ?? [])].some(text =>
      text.toLowerCase().includes(keyword)
    )
})
</script>

<template>
  <section>
    <GridToolbar
      :groups="visibleGroups"
      :selection="configStore.currentGroup"
      :search="configStore.currentSearchKeyword"
      :layout="layout"
      placeholder="搜索站点…"
      @update:selection="setSelection"
      @update:search="configStore.setSearchKeyword"
      @update:layout="configStore.setLayout"
    />

    <template v-if="sections.length > 0">
      <div v-for="section in sections" :key="section.key" class="mb-6">
        <h2 v-if="section.name" class="mb-2 text-xs font-semibold tracking-wide text-fg-subtle uppercase">
          {{ section.name }}
        </h2>
        <div class="auto-grid">
          <SiteCard
            v-for="site in section.items"
            :key="site.key"
            :site="site"
            :effective-type="effectiveType"
            :show-description="configStore.showDescription"
          />
        </div>
      </div>
    </template>
    <p v-else class="glass px-4 py-10 text-center text-sm text-fg-subtle">没有匹配的站点</p>
  </section>
</template>
