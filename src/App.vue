<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import AppHeader from '@/components/layout/AppHeader.vue'
import GreetingClock from '@/components/layout/GreetingClock.vue'
import ContentTabs from '@/components/layout/ContentTabs.vue'
import LoadingScreen from '@/components/common/LoadingScreen.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import SiteGrid from '@/components/sites/SiteGrid.vue'
import DockerGrid from '@/components/docker/DockerGrid.vue'
import ServiceGrid from '@/components/luckyServices/ServiceGrid.vue'

const configStore = useConfigStore()
const navStore = useNavStore()

const booting = ref(true)

const currentLayout = computed(() => {
  if (configStore.currentTab === 'docker') return configStore.dockerLayout
  if (configStore.currentTab === 'luckyServices') return configStore.luckyServicesLayout
  return configStore.layout
})

const availableTabs = computed(() => {
  const tabs: string[] = []
  if (navStore.sitesEnabled) tabs.push('sites')
  if (navStore.dockerEnabled && navStore.allContainers.length > 0) tabs.push('docker')
  if (navStore.luckyServicesEnabled && navStore.allLuckyServices.length > 0) tabs.push('luckyServices')
  return tabs
})

const emptyState = computed(() => !booting.value && availableTabs.value.length === 0)

/** 细节调整：四个比例变量参与 CSS calc，无需快照主题颜色 */
watch(
  () => configStore.config,
  cfg => {
    const root = document.documentElement
    root.style.setProperty('--text-factor', (cfg.detailTextContrast / 100).toFixed(3))
    root.style.setProperty('--radius-scale', (cfg.detailRadiusScale / 100).toFixed(3))
    root.style.setProperty('--blur-scale', (cfg.detailGlassBlurScale / 100).toFixed(3))
    root.style.setProperty('--alpha-scale', (cfg.detailGlassOpacityScale / 100).toFixed(3))
    root.style.setProperty('--card-scale', (cfg.siteCardSize / 100).toFixed(3))
  },
  { deep: true, immediate: true }
)

watch(() => configStore.theme, theme => document.documentElement.setAttribute('data-theme', theme), {
  immediate: true
})
watch(currentLayout, layout => document.documentElement.setAttribute('data-layout', layout), {
  immediate: true
})
watch(
  () => configStore.config.detailReduceMotion,
  reduce => document.documentElement.setAttribute('data-reduce-motion', String(reduce)),
  { immediate: true }
)

watch(
  () => navStore.panelTitle,
  title => {
    if (title) document.title = title
  },
  { immediate: true }
)

watch(
  () => navStore.panelFavicon,
  favicon => {
    if (!favicon) return
    const href = /^https?:\/\//i.test(favicon) ? favicon : `./backend/iconlibs/${favicon}`
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = href
  },
  { immediate: true }
)

function syncPolling() {
  navStore.stopDockerStatsPolling()
  navStore.stopLuckyServicesStatsPolling()
  if (document.hidden) return
  if (configStore.currentTab === 'docker') navStore.startDockerStatsPolling()
  if (configStore.currentTab === 'luckyServices') navStore.startLuckyServicesStatsPolling()
}

watch([() => configStore.currentTab, booting], syncPolling, { immediate: true })
watch(availableTabs, tabs => {
  if (tabs.length > 0 && !tabs.includes(configStore.currentTab)) {
    configStore.setCurrentTab(tabs[0] as typeof configStore.currentTab)
  }
})

onMounted(async () => {
  const started = Date.now()
  configStore.loadConfig()
  await Promise.all([navStore.loadNavConfig(), navStore.fetchServerConfig()]).then(([, serverConfig]) => {
    configStore.applyServerConfig(serverConfig)
  })

  await Promise.all([
    navStore.sitesEnabled ? navStore.loadSitesData() : null,
    navStore.dockerEnabled ? navStore.loadDockerData() : null,
    navStore.luckyServicesEnabled ? navStore.loadLuckyServicesData() : null
  ])

  if (configStore.networkMode === 'auto' || configStore.networkMode === 'hybrid') {
    navStore.fetchNetworkType()
  }

  // 最短展示 500ms，避免闪烁
  const rest = 500 - (Date.now() - started)
  if (rest > 0) await new Promise(resolve => setTimeout(resolve, rest))
  booting.value = false
  syncPolling()
})

function onVisibility() {
  syncPolling()
}

onMounted(() => document.addEventListener('visibilitychange', onVisibility))
onUnmounted(() => {
  document.removeEventListener('visibilitychange', onVisibility)
  navStore.stopDockerStatsPolling()
  navStore.stopLuckyServicesStatsPolling()
})
</script>

<template>
  <!-- 背景图 + 主题色遮罩：任意背景图下，明暗主题的文字对比度都由 --bg-page 兜底 -->
  <div class="relative min-h-dvh" :style="configStore.backgroundStyle">
    <div class="absolute inset-0 bg-[hsl(var(--bg-page)/0.55)]" aria-hidden="true" />

    <LoadingScreen :visible="booting" />

    <div class="relative mx-auto max-w-6xl px-4 py-4" :style="{ zoom: String(configStore.config.layoutScale) }">
      <AppHeader v-if="configStore.showHeader" />

      <div v-else class="mb-4 flex flex-wrap items-center gap-2">
        <GreetingClock v-if="configStore.showTime" />
        <ContentTabs class="ml-auto" />
        <button
          type="button"
          class="glass ml-auto grid size-8 place-items-center text-fg-muted hover:text-fg"
          aria-label="打开设置"
          @click="configStore.toggleSettingsPanel()"
        >
          <Settings class="size-4" />
        </button>
      </div>

      <main>
        <SiteGrid v-if="configStore.currentTab === 'sites' && navStore.sitesEnabled" />
        <DockerGrid v-else-if="configStore.currentTab === 'docker' && navStore.dockerEnabled" />
        <ServiceGrid v-else-if="configStore.currentTab === 'luckyServices' && navStore.luckyServicesEnabled" />
        <p v-else-if="emptyState" class="glass px-4 py-16 text-center text-sm text-fg-subtle">
          当前没有可显示的站点、Docker 容器或 Lucky 服务。
        </p>
      </main>
    </div>

    <BackToTop />
    <SettingsPanel />
  </div>
</template>
