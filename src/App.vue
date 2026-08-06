<script setup lang="ts">
import { onMounted, computed, watch, ref, provide } from 'vue'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import { THEMES } from '@/themes/registry'
import type { TabType } from '@/types'
import LoadingScreen from '@/components/common/LoadingScreen.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import GreetingClock from '@/components/layout/GreetingClock.vue'
import ContentTabs from '@/components/common/ContentTabs.vue'
import SiteGrid from '@/components/sites/SiteGrid.vue'
import DockerGrid from '@/components/docker/DockerGrid.vue'
import ServiceGrid from '@/components/luckyServices/ServiceGrid.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import BackToTop from '@/components/common/BackToTop.vue'
import LinkDropdown from '@/components/common/LinkDropdown.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import { Settings } from 'lucide-vue-next'

const navStore = useNavStore()
const configStore = useConfigStore()

const EMPTY_STATE_CONFIG = {
  icon: '🗂️',
  title: '暂无可用内容',
  description: '当前没有可显示的站点、Docker 容器或 Lucky 服务。'
} as const

// 链接下拉菜单组件引用
const linkDropdownRef = ref<InstanceType<typeof LinkDropdown> | null>(null)

// 提供给子组件
provide('linkDropdown', {
  show: (site: any, urls: any[], target: HTMLElement) => {
    linkDropdownRef.value?.show(site, urls, target)
  }
})

// 计算属性
const isLoading = computed(() => navStore.isLoading)
const currentTab = computed(() => configStore.currentTab)

// 各标签页是否可见
const hasSites = computed(() => navStore.sitesEnabled)
const hasDocker = computed(() => navStore.dockerEnabled && navStore.allContainers.length > 0)
const hasLuckyServices = computed(() => navStore.luckyServicesEnabled && navStore.allLuckyServices.length > 0)
const showHeader = computed(() => configStore.showHeader)
const availableTabs = computed<TabType[]>(() => {
  const tabs: TabType[] = []

  if (hasSites.value) {
    tabs.push('sites')
  }
  if (hasDocker.value) {
    tabs.push('docker')
  }
  if (hasLuckyServices.value) {
    tabs.push('luckyServices')
  }

  return tabs
})
const showGlobalEmptyState = computed(() => !isLoading.value && availableTabs.value.length === 0)

// 当前主题的背景组件（从注册表获取）
const currentThemeBackground = computed(() => {
  return THEMES.find(t => t.value === configStore.theme)?.backgroundComponent
})

// 获取第一个可用的标签页
function getFirstAvailableTab(): TabType | null {
  return availableTabs.value[0] ?? null
}

// 检查并修正当前标签页
function ensureValidTab() {
  const tab = currentTab.value
  const isCurrentTabValid = availableTabs.value.includes(tab)

  if (!isCurrentTabValid) {
    const firstTab = getFirstAvailableTab()
    if (firstTab) {
      configStore.setCurrentTab(firstTab)
    }
  }
}

// 拼接图标 URL
function getIconUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `./backend/iconlibs/${path}`
}

// 主题切换
watch(
  () => configStore.effectiveTheme,
  (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
  },
  { immediate: true }
)

// ============ 细节调整（文字对比度 / 圆角 / 玻璃模糊 / 卡片不透明度 / 减弱动效） ============

// 细节调整涉及的 CSS 变量
const DETAIL_TEXT_VARS = ['--text-primary', '--text-secondary', '--text-muted'] as const
const DETAIL_BLUR_VARS = ['--glass-blur', '--site-card-blur'] as const
const DETAIL_OPACITY_VARS = ['--glass-bg', '--glass-bg-hover', '--card-bg', '--site-card-bg', '--site-card-bg-hover'] as const
const DETAIL_RADIUS_VARS = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl'] as const
const ALL_DETAIL_VARS = [...DETAIL_TEXT_VARS, ...DETAIL_BLUR_VARS, ...DETAIL_OPACITY_VARS, ...DETAIL_RADIUS_VARS]

// 当前主题的原始变量快照（用于避免重复计算叠乘）
let themeDetailBase: Record<string, string> = {}

function snapshotThemeDetails() {
  const el = document.documentElement
  // 先清除内联覆盖，读取纯主题值
  ALL_DETAIL_VARS.forEach(v => el.style.removeProperty(v))
  const cs = getComputedStyle(el)
  themeDetailBase = {}
  ALL_DETAIL_VARS.forEach(v => {
    themeDetailBase[v] = cs.getPropertyValue(v).trim()
  })
}

function applyThemeDetails() {
  const el = document.documentElement
  const cfg = configStore.config

  // 文字对比度：按当前明暗方向调整亮度
  const contrast = cfg.detailTextContrast / 100
  DETAIL_TEXT_VARS.forEach(v => {
    const raw = themeDetailBase[v]
    const m = raw.match(/^([\d.]+)\s+([\d.]+%)\s+([\d.]+%)$/)
    if (!m) return
    const hue = m[1]
    const sat = m[2]
    const light = parseFloat(m[3])
    const isLightText = light >= 50
    const factor = isLightText ? contrast : 1 / contrast
    const next = Math.min(99, Math.max(1, light * factor))
    el.style.setProperty(v, `${hue} ${sat} ${next.toFixed(1)}%`)
  })

  // 玻璃模糊
  const blur = cfg.detailGlassBlurScale / 100
  DETAIL_BLUR_VARS.forEach(v => {
    const base = parseFloat(themeDetailBase[v]) || 20
    el.style.setProperty(v, `${Math.round(base * blur)}px`)
  })

  // 卡片/玻璃不透明度
  const opacity = cfg.detailGlassOpacityScale / 100
  DETAIL_OPACITY_VARS.forEach(v => {
    const m = themeDetailBase[v].match(/^(.+?)\s*\/\s*([\d.]+)$/)
    if (!m) return
    const alpha = Math.min(1, parseFloat(m[2]) * opacity)
    el.style.setProperty(v, `${m[1]} / ${alpha.toFixed(3)}`)
  })

  // 圆角
  const radius = cfg.detailRadiusScale / 100
  DETAIL_RADIUS_VARS.forEach(v => {
    const base = parseFloat(themeDetailBase[v]) || 0
    el.style.setProperty(v, `${Math.round(base * radius)}px`)
  })

  // 减弱动效
  el.classList.toggle('motion-reduced', cfg.detailReduceMotion)
}

watch(
  () => [
    configStore.effectiveTheme,
    configStore.config.detailTextContrast,
    configStore.config.detailRadiusScale,
    configStore.config.detailGlassBlurScale,
    configStore.config.detailGlassOpacityScale,
    configStore.config.detailReduceMotion
  ],
  () => {
    snapshotThemeDetails()
    applyThemeDetails()
  },
  { immediate: true }
)

// 浏览器标题更新
watch(
  () => navStore.panelTitle,
  (title) => {
    if (title) {
      document.title = title
    }
  },
  { immediate: true }
)

// 浏览器 Favicon 更新
watch(
  () => navStore.panelFavicon,
  (favicon) => {
    if (favicon) {
      const faviconUrl = getIconUrl(favicon)
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }
  },
  { immediate: true }
)

// 初始化
onMounted(async () => {
  navStore.isLoading = true

  // 先加载本地配置（包含默认值）
  configStore.loadConfig()

  const startTime = Date.now()

  // 兜底：无论初始化多久都最多黑屏 3 秒
  const forceFinish = setTimeout(() => {
    navStore.isLoading = false
  }, 3000)

  // 最短展示时间（避免过快闪烁），成功后淡出
  const finish = () => {
    clearTimeout(forceFinish)
    const elapsed = Date.now() - startTime
    const wait = Math.max(0, 500 - elapsed)
    setTimeout(() => {
      navStore.isLoading = false
    }, wait)
  }

  try {
    // 加载基础配置（nav.json）和服务器配置
    const [, serverConfig] = await Promise.all([
      navStore.loadNavConfig(),
      navStore.fetchServerConfig()
    ])

    // 尝试应用服务器配置
    if (serverConfig) {
      configStore.applyServerConfig(serverConfig)
    }

    // 预加载已启用模块的数据，用于决定顶部页签是否显示；
    // 网络类型识别（自动/混合模式）与数据预加载并行，不再串行等待
    const preloadTasks: Promise<unknown>[] = []

    if (navStore.sitesEnabled) {
      preloadTasks.push(navStore.loadSitesData())
    }
    if (navStore.dockerEnabled) {
      preloadTasks.push(navStore.loadDockerData())
    }
    if (navStore.luckyServicesEnabled) {
      preloadTasks.push(navStore.loadLuckyServicesData())
    }

    const mode = configStore.networkMode
    if (mode === 'auto' || mode === 'hybrid') {
      preloadTasks.push(navStore.fetchNetworkType())
    }

    await Promise.all(preloadTasks)

    // 检查当前标签页是否有效，无效则切换到第一个可用标签页
    ensureValidTab()
  } finally {
    finish()
  }
})

watch(availableTabs, () => {
  ensureValidTab()
})
</script>

<template>
  <!-- 主题背景 -->
  <component :is="currentThemeBackground" />

  <!-- 加载屏幕 -->
  <Transition name="screen-fade">
    <LoadingScreen v-if="isLoading" />
  </Transition>

  <!-- 主内容 -->
  <div v-if="!isLoading" class="app-main">
    <!-- 页头 -->
    <AppHeader v-if="showHeader" />

    <!-- 问候语 + 大时钟 -->
    <div v-if="configStore.showTime" class="greeting-clock-wrap">
      <GreetingClock />
    </div>

    <!-- 浮动设置按钮（仅在隐藏页头时显示） -->
    <button 
      v-if="!showHeader" 
      class="floating-settings-btn"
      @click="configStore.toggleSettingsPanel(true)"
    >
      <Settings class="floating-settings-icon" />
    </button>

    <!-- 搜索栏（仅在站点页面显示） -->
    <SearchBar v-if="configStore.showSearch && currentTab === 'sites' && hasSites" />

    <!-- 主区域 -->
    <main class="main-content" :class="{ 'no-header': !showHeader }" :style="{ '--layout-scale': configStore.layoutScale }">
      <!-- 内容标签页 -->
      <ContentTabs class="mb-16" />

      <!-- 站点网格 -->
      <SiteGrid v-if="currentTab === 'sites' && hasSites" />

      <!-- Docker 网格 -->
      <DockerGrid v-else-if="currentTab === 'docker' && hasDocker" />

      <!-- Lucky 服务网格 -->
      <ServiceGrid v-else-if="currentTab === 'luckyServices' && hasLuckyServices" />

      <div v-else-if="showGlobalEmptyState" class="global-empty-state">
        <div class="global-empty-icon">{{ EMPTY_STATE_CONFIG.icon }}</div>
        <h2 class="global-empty-title">{{ EMPTY_STATE_CONFIG.title }}</h2>
        <p class="global-empty-description">{{ EMPTY_STATE_CONFIG.description }}</p>
      </div>
    </main>

    <!-- 设置面板 -->
    <SettingsPanel />

    <!-- 返回顶部 -->
    <BackToTop />

    <!-- 链接选择下拉菜单 -->
    <LinkDropdown ref="linkDropdownRef" />
  </div>
</template>

<style scoped>
.app-main {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1rem 2rem;
  zoom: var(--layout-scale, 1);
}

.greeting-clock-wrap {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.main-content.no-header {
  padding-top: 1rem;
}

.global-empty-state {
  min-height: min(48vh, 420px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
  border: 1px solid hsl(var(--glass-border));
  border-radius: 1.5rem;
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  box-shadow:
    0 24px 48px rgba(15, 23, 42, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.global-empty-icon {
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary-dark) / 0.08) 100%);
  font-size: 2rem;
}

.global-empty-title {
  margin: 0;
  color: hsl(var(--text-primary));
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 700;
}

.global-empty-description {
  margin: 0;
  max-width: 32rem;
  color: hsl(var(--text-secondary));
  line-height: 1.6;
}

@media (min-width: 640px) {
  .main-content {
    padding: 0.75rem 1.5rem 2.5rem;
  }

  .greeting-clock-wrap {
    padding: 0 1.5rem;
  }
  
  .main-content.no-header {
    padding-top: 1.5rem;
  }
}

/* 移动端 ContentTabs 间距调整 */
@media (max-width: 480px) {
  .main-content .mb-16 {
    margin-bottom: 0.75rem;
  }

  .global-empty-state {
    min-height: 42vh;
    padding: 1.5rem 1rem;
    border-radius: 1.25rem;
  }
}

/* 加载屏淡出过渡 */
.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 400ms ease;
}
.screen-fade-enter-from,
.screen-fade-leave-to {
  opacity: 0;
}

/* 浮动设置按钮 */
.floating-settings-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--glass-border) / 0.3);
  background: hsl(var(--glass-bg) / 0.3);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  color: hsl(var(--text-muted) / 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 300ms ease;
  box-shadow: none;
  opacity: 0.5;
}

.floating-settings-btn:hover {
  opacity: 1;
  color: hsl(var(--neon-cyan));
  border-color: hsl(var(--neon-cyan) / 0.4);
  background: hsl(var(--glass-bg));
  box-shadow: 0 0 15px hsl(var(--neon-cyan) / 0.3);
  transform: scale(1.05);
}

.floating-settings-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 500ms;
}

.floating-settings-btn:hover .floating-settings-icon {
  transform: rotate(90deg);
}
</style>
