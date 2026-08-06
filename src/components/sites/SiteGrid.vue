<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import SiteCard from './SiteCard.vue'
import SearchBox from '@/components/common/SearchBox.vue'
import GroupDropdown from '@/components/common/GroupDropdown.vue'
import NetworkModeDropdown from '@/components/common/NetworkModeDropdown.vue'
import LayoutSwitcher from '@/components/common/LayoutSwitcher.vue'
import type { Site, Group } from '@/types'

const navStore = useNavStore()
const configStore = useConfigStore()
const { searchKeywords } = storeToRefs(configStore)

// 搜索关键字
const searchKeyword = computed({
  get: () => searchKeywords.value.sites,
  set: (val: string) => {
    searchKeywords.value.sites = val
  }
})

// 搜索过滤函数
function matchSearch(site: Site, keyword: string): boolean {
  if (!keyword) return true
  const kw = keyword.toLowerCase()
  
  // 匹配名称
  if (site.name.toLowerCase().includes(kw)) return true
  
  // 匹配描述
  if (site.description?.toLowerCase().includes(kw)) return true
  
  // 匹配外网链接
  if (site.frontendUrls?.some(url => url.toLowerCase().includes(kw))) return true
  
  // 匹配内网链接
  if (site.backendUrls?.some(url => url.toLowerCase().includes(kw))) return true
  
  return false
}

// 筛选后的站点列表（用于多选分组模式）
const filteredSites = computed(() => {
  let sites = navStore.allSites
  
  // 按分组筛选（支持多选）
  const selectedGroups = configStore.currentGroupArray
  if (selectedGroups.length > 0) {
    sites = sites.filter((s: Site) => s.groupKey && selectedGroups.includes(s.groupKey))
  }
  
  // 按搜索关键字筛选
  const kw = searchKeyword.value
  if (kw) {
    sites = sites.filter((s: Site) => matchSearch(s, kw))
  }
  
  return sites
})

// 按分组组织的站点（用于全部模式或多选分组模式）
const groupedSites = computed(() => {
  const result: { group: Group; sites: Site[] }[] = []
  const allSites = navStore.allSites
  const kw = searchKeyword.value
  const selectedGroups = configStore.currentGroupArray
  
  // 确定要显示的分组
  const groupsToShow = selectedGroups.length > 0
    ? navStore.siteGroups.filter((g: Group) => selectedGroups.includes(g.key))
    : navStore.siteGroups
  
  for (const group of groupsToShow) {
    let sites = allSites.filter((s: Site) => s.groupKey === group.key)
    // 按搜索关键字筛选
    if (kw) {
      sites = sites.filter((s: Site) => matchSearch(s, kw))
    }
    if (sites.length > 0) {
      result.push({ group, sites })
    }
  }
  
  return result
})

// 分组列表（只显示有站点的分组，并统计数量）
const groups = computed(() => {
  const allSites = navStore.allSites
  const groupsWithCount = navStore.siteGroups
    .map((g: Group) => {
      const count = allSites.filter((s: Site) => s.groupKey === g.key).length
      return { ...g, count }
    })
    .filter(g => g.count > 0)
  return [
    { key: 'all', name: '全部', icon: '', count: allSites.length },
    ...groupsWithCount
  ]
})

// 监听分组列表变化，如果当前分组不存在则自动切换到全部
watch(groups, (newGroups) => {
  const currentGroup = configStore.currentGroup
  if (currentGroup !== 'all') {
    const exists = newGroups.some(g => g.key === currentGroup)
    if (!exists) {
      configStore.resetCurrentTabGroup()
    }
  }
}, { immediate: true })

// 网格类名（根据布局模式）
const gridClass = computed(() => {
  const layout = configStore.layout
  switch (layout) {
    case 'compact':
      return 'site-grid compact'
    case 'large':
      return 'site-grid large'
    case 'list':
      return 'site-grid list'
    case 'minimal':
      return 'site-grid minimal'
    case 'rack':
      return 'site-grid rack'
    case 'map':
      return 'site-grid map'
    default: // normal
      return 'site-grid normal'
  }
})

// 地铁线路配色 - 每个分组一条线
const MAP_LINE_COLORS = [
  '192 70% 55%',   // 青
  '265 60% 62%',   // 紫
  '155 55% 46%',   // 绿
  '40 80% 55%',    // 琥珀
  '215 65% 60%',   // 蓝
  '330 60% 62%'    // 粉
]

// 根据分组序号取线路颜色（作为 CSS 变量绑定到网格容器）
function mapLineStyle(index: number) {
  return { '--map-line': MAP_LINE_COLORS[index % MAP_LINE_COLORS.length] }
}

</script>

<template>
  <div class="site-section">
    <!-- 分组筛选 -->
    <div class="filter-bar">
      <SearchBox
        v-model="searchKeyword"
        placeholder="搜索站点..."
        color="cyan"
      />
      <div class="filter-bar-right">
        <GroupDropdown
          :groups="groups"
          :current="configStore.currentGroup"
          color="cyan"
          @change="configStore.setCurrentGroup"
          @toggle="configStore.toggleGroup"
        />
        <NetworkModeDropdown />
        <LayoutSwitcher />
      </div>
    </div>

    <!-- 全部模式或多选分组模式：按分组显示 -->
    <template v-if="configStore.isAllSelected || configStore.currentGroupArray.length > 1">
      <div 
        v-for="(item, index) in groupedSites" 
        :key="item.group.key" 
        class="group-section"
        :class="{ 'has-margin': index < groupedSites.length - 1 }"
        :style="configStore.layout === 'map' ? mapLineStyle(index) : undefined"
      >
        <!-- 分组标题 -->
        <h3 class="group-title" :class="{ 'map-group-title': configStore.layout === 'map' }">{{ item.group.name }}</h3>
        <!-- 站点网格 -->
        <div :class="gridClass">
          <SiteCard
            v-for="site in item.sites"
            :key="site.key"
            :site="site"
            class="animate-fade-in-up"
          />
        </div>
      </div>
      <!-- 空状态 -->
      <div v-if="groupedSites.length === 0" class="empty-state">
        <div class="empty-icon">
          <span>📂</span>
        </div>
        <p class="empty-text">暂无站点</p>
      </div>
    </template>

    <!-- 单个分组模式（只选了一个分组） -->
    <template v-else>
      <!-- 站点网格 -->
      <div :class="gridClass" :style="configStore.layout === 'map' ? mapLineStyle(0) : undefined">
        <SiteCard
          v-for="site in filteredSites"
          :key="site.key"
          :site="site"
          class="animate-fade-in-up"
        />
      </div>
      <!-- 空状态 -->
      <div v-if="filteredSites.length === 0" class="empty-state">
        <div class="empty-icon">
          <span>📂</span>
        </div>
        <p class="empty-text">暂无站点</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.site-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  min-width: 0;
}

.filter-bar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .filter-bar :deep(.search-box) {
    max-width: none;
    width: 100%;
  }
  
  .filter-bar-right {
    justify-content: space-evenly;
    gap: 0.5rem;
  }
}

.group-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-section.has-margin {
  margin-bottom: 1rem;
}

@media (max-width: 480px) {
  .group-section {
    gap: 0.5rem;
  }
  
  .group-section.has-margin {
    margin-bottom: 0.5rem;
  }
}

.group-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
}

/* 深色主题分组标题 - 提高亮度增强可读性 */
[data-theme="dark"] .group-title {
  color: hsl(210 40% 85%);
}

/* 网格布局 */
.site-grid {
  display: grid;
  gap: clamp(0.75rem, 2vw, 1rem);
}

/* Normal 布局 - Launcher 大图标竖排网格 */
.site-grid.normal {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  /* 3D 抬升透视 */
  perspective: 1200px;
}

/* Compact 布局 - 超紧凑横向条 */
.site-grid.compact {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: clamp(0.375rem, 1.5vw, 0.5rem);
}

/* Large 布局（保留向后兼容）*/
.site-grid.large {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  /* 3D 抬升透视 */
  perspective: 1200px;
}

/* List 布局 */
.site-grid.list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 大屏幕下列表模式使用双列 */
@media (min-width: 1400px) {
  .site-grid.list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem 1.5rem;
  }
}

/* Minimal 布局 - 纯图标网格，类似 Dock/Launcher */
.site-grid.minimal {
  grid-template-columns: repeat(auto-fill, minmax(3.5rem, 1fr));
  gap: 1.25rem;
  justify-items: center;
}

/* Rack 布局 - 单列 1U 面板，像标准 19" 机柜 */
.site-grid.rack {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 大屏幕下机柜布局双列 */
@media (min-width: 1400px) {
  .site-grid.rack {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 0.875rem;
  }
}

@media (max-width: 720px) {
  .site-grid.rack {
    gap: 0.375rem;
  }
}

/* Map 布局 - 地铁线路图 */
.site-grid.map {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 地铁线路主干线 */
.site-grid.map::before {
  content: '';
  position: absolute;
  top: 0.5rem;
  bottom: 0.5rem;
  left: 1.0625rem;
  width: 2px;
  background: hsl(var(--map-line, var(--neon-cyan)) / 0.35);
  transform: translateX(-50%);
  border-radius: 1px;
}

/* 分组标题 - 线路配色 */
.map-group-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: hsl(var(--map-line, var(--neon-cyan)));
}

.map-group-title::before {
  content: '';
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background: hsl(var(--map-line, var(--neon-cyan)));
  box-shadow: 0 0 10px hsl(var(--map-line, var(--neon-cyan)) / 0.6);
  flex-shrink: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon span {
  font-size: 1.875rem;
}

.empty-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

/* 浅色主题适配 */
[data-theme="light"] .empty-icon {
  background: rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .empty-text {
  color: rgba(0, 0, 0, 0.45);
}
</style>
