<script setup lang="ts">
import { computed, inject } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfigStore } from '@/stores/config'
import { useNavStore } from '@/stores/nav'
import type { Site, LinkItem } from '@/types'
import {
  getEffectiveNetworkType,
  getHybridUrls,
  getSingleTypeUrls,
  getBestUrl,
  toSiteLinks
} from '@/utils/siteLinks'
import SiteCardDefault from './SiteCardDefault.vue'
import SiteCardMinimal from './SiteCardMinimal.vue'
import SiteCardRack from './SiteCardRack.vue'
import SiteCardMap from './SiteCardMap.vue'

interface LinkItemProp {
  url: string
  label: string
  type: 'internal' | 'external'
}

const props = defineProps<{
  site: Site
}>()

const configStore = useConfigStore()
const navStore = useNavStore()

// 使用 storeToRefs 确保正确解包响应式属性
const { networkMode } = storeToRefs(configStore)
const { networkType, networkTypeFetchFailed } = storeToRefs(navStore)

// 注入链接下拉菜单
const linkDropdown = inject<{ show: (site: Site, urls: LinkItemProp[], target: HTMLElement) => void }>('linkDropdown')

// 当前生效的网络类型（根据网络模式）
const effectiveNetworkType = computed(() =>
  getEffectiveNetworkType(networkMode.value, networkType.value, networkTypeFetchFailed.value)
)

// 点击卡片处理
function handleClick(event: MouseEvent) {
  event.preventDefault()

  const effectiveType = effectiveNetworkType.value
  const links = toSiteLinks(props.site)
  const validFrontend = links.frontendUrls
  const validBackend = links.backendUrls

  // 混合模式（包括自动模式查询失败的降级情况）：只要有多个链接就弹出下拉菜单让用户选择
  if (effectiveType === 'hybrid') {
    const urls = getHybridUrls(props.site)
    if (urls.length > 1 && linkDropdown) {
      linkDropdown.show(props.site, urls as LinkItem[], event.currentTarget as HTMLElement)
      return
    }
  }

  // 外网模式
  if (effectiveType === 'external') {
    // 有多个外网链接：显示外网链接下拉菜单
    if (validFrontend.length > 1 && linkDropdown) {
      const urls = getSingleTypeUrls(props.site, 'external')
      linkDropdown.show(props.site, urls as LinkItem[], event.currentTarget as HTMLElement)
      return
    }
    // 没有外网链接但有多个内网链接：显示内网链接下拉菜单（降级处理）
    if (validFrontend.length === 0 && validBackend.length > 1 && linkDropdown) {
      const urls = getSingleTypeUrls(props.site, 'internal')
      linkDropdown.show(props.site, urls as LinkItem[], event.currentTarget as HTMLElement)
      return
    }
  }

  // 内网模式
  if (effectiveType === 'internal') {
    // 有多个内网链接：显示内网链接下拉菜单
    if (validBackend.length > 1 && linkDropdown) {
      const urls = getSingleTypeUrls(props.site, 'internal')
      linkDropdown.show(props.site, urls as LinkItem[], event.currentTarget as HTMLElement)
      return
    }
    // 没有内网链接但有多个外网链接：显示外网链接下拉菜单（降级处理）
    if (validBackend.length === 0 && validFrontend.length > 1 && linkDropdown) {
      const urls = getSingleTypeUrls(props.site, 'external')
      linkDropdown.show(props.site, urls as LinkItem[], event.currentTarget as HTMLElement)
      return
    }
  }

  // 其他情况直接打开链接
  const url = getBestUrl(props.site, effectiveType)
  if (url) {
    const target = props.site.target || '_blank'
    window.open(url, target)
  }
}

// 键盘事件处理（可访问性）
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick(event as unknown as MouseEvent)
  }
}

// 可访问性标签
const ariaLabel = computed(() => {
  const parts = [`打开 ${props.site.name}`]
  if (props.site.description) {
    parts.push(props.site.description)
  }
  return parts.join(' - ')
})

// 图标 URL
const iconUrl = computed(() => {
  const { iconUrl } = props.site
  if (!iconUrl) return null

  if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
    return iconUrl
  }

  return `./backend/iconlibs/${iconUrl}`
})

// 是否显示描述
const showDesc = computed(() => Boolean(configStore.showDescription && props.site.description))

// 布局模式
const layout = computed(() => configStore.layout)

// 卡片类名
const cardClass = computed(() => {
  const classes = ['cyber-card', 'group']
  if (layout.value === 'list') classes.push('layout-list')
  else if (layout.value === 'minimal') classes.push('layout-minimal')
  else if (layout.value === 'compact') classes.push('layout-compact')
  else if (layout.value === 'rack') classes.push('layout-rack')
  else if (layout.value === 'map') classes.push('layout-map')
  else classes.push('layout-default')
  return classes.join(' ')
})
</script>

<template>
  <div
    :class="cardClass"
    role="button"
    :tabindex="0"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- 边框发光线 -->
    <div class="card-border-glow" />

    <!-- 默认布局（normal / compact / large / list） -->
    <SiteCardDefault
      v-if="layout !== 'minimal' && layout !== 'rack' && layout !== 'map'"
      :site="site"
      :icon-url="iconUrl"
      :show-desc="showDesc"
    />

    <!-- Minimal 布局：纯图标模式 -->
    <SiteCardMinimal
      v-else-if="layout === 'minimal'"
      :site="site"
      :icon-url="iconUrl"
    />

    <!-- Rack 布局：1U 前面板 -->
    <SiteCardRack
      v-else-if="layout === 'rack'"
      :site="site"
      :icon-url="iconUrl"
      :show-desc="showDesc"
    />

    <!-- Map 布局：地铁线路站台 -->
    <SiteCardMap
      v-else
      :site="site"
      :icon-url="iconUrl"
      :show-desc="showDesc"
    />
  </div>
</template>

<style scoped>
/* ============================================
   站点卡片外壳 - 公共部分
   各布局内部样式见对应子组件（SiteCard* / SiteIcon）
   ============================================ */

/* 卡片基础容器 */
.cyber-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  /* 使用站点卡片专属变量 */
  background: hsl(var(--site-card-bg));
  backdrop-filter: blur(var(--site-card-blur)) saturate(var(--site-card-saturation));
  -webkit-backdrop-filter: blur(var(--site-card-blur)) saturate(var(--site-card-saturation));
  border: 1px solid hsl(var(--site-card-border));
  box-shadow: var(--site-card-shadow);
  /* 弹性缓动 - 更有质感的悬浮 */
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease,
    border-color 300ms ease,
    background 300ms ease;
  display: block;
  text-decoration: none;
  cursor: pointer;
}

/* 磨砂内层叠加 - 增强通透感 */
.cyber-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    hsl(var(--site-card-inner-glow)) 0%,
    transparent 50%,
    transparent 100%
  );
  opacity: var(--site-card-shine-opacity);
  transition: opacity var(--duration-normal) ease;
  pointer-events: none;
  z-index: 1;
}

.cyber-card.layout-default {
  padding: 1rem 0.875rem 0.875rem;
}

/* ========== Compact 布局：超紧凑横向条 ========== */
.cyber-card.layout-compact {
  padding: 0.375rem 0.5rem;
  border-radius: var(--radius-md);
}

.cyber-card.layout-compact:hover {
  transform: translateY(-2px);
}

/* ========== Minimal 布局：纯图标模式（外壳透明化） ========== */
.cyber-card.layout-minimal {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.cyber-card.layout-minimal::before,
.cyber-card.layout-minimal .card-border-glow {
  display: none;
}

.cyber-card.layout-minimal:hover {
  transform: none;
  background: transparent;
  box-shadow: none;
}

/* ========== List 布局 ========== */
.cyber-card.layout-list {
  padding: 0.875rem 1rem;
  border-left: 3px solid transparent;
  transition:
    transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease,
    border-color 300ms ease,
    background 300ms ease,
    border-left-color 300ms ease;
}

.cyber-card.layout-list:hover {
  transform: translateY(-2px);
  border-left-color: hsl(var(--neon-cyan));
}

/* ========== Rack 布局：1U 前面板（外壳） ========== */
.cyber-card.layout-rack {
  padding: 0;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.cyber-card.layout-rack:hover {
  transform: translateX(-6px);
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 20px -6px hsl(var(--neon-cyan) / 0.3),
    0 0 40px -10px hsl(var(--neon-purple) / 0.15);
}

/* ========== Map 布局：地铁线路站台（外壳透明化） ========== */
.cyber-card.layout-map {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 0;
}

.cyber-card.layout-map::before,
.cyber-card.layout-map .card-border-glow {
  display: none;
}

.cyber-card.layout-map:hover {
  transform: none;
  background: transparent;
  box-shadow: none;
  border: none;
}

/* ========== 通用 hover 效果（非 Minimal） ========== */
.cyber-card:not(.layout-minimal):hover {
  transform: translateY(-4px) scale(1.01);
  background: hsl(var(--site-card-bg-hover));
  border-color: hsl(var(--site-card-border-hover));
  /* 多层次阴影 + 外发光 */
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 20px -6px hsl(var(--neon-cyan) / 0.3),
    0 0 40px -10px hsl(var(--neon-purple) / 0.15);
}

.cyber-card:not(.layout-minimal):hover::before {
  opacity: var(--site-card-shine-hover);
}

/* ========== Launcher 3D 抬升（normal / large） ==========
   默认主题生效；特色主题以各自的 !important hover 规则为准 */
.cyber-card.layout-default:hover {
  transform: translateY(-6px) rotateX(6deg) scale(1.02);
  box-shadow:
    var(--site-card-shadow-hover),
    0 24px 48px -12px rgba(0, 0, 0, 0.35),
    0 0 20px -6px hsl(var(--neon-cyan) / 0.3);
}

.cyber-card.layout-default:hover::before {
  opacity: var(--site-card-shine-hover);
}

/* 边框发光线 - 更精细 */
.card-border-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid transparent;
  background: linear-gradient(
    135deg,
    hsl(var(--neon-cyan) / 0.1) 0%,
    hsl(var(--neon-purple) / 0.05) 50%,
    hsl(var(--neon-cyan) / 0.1) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
  z-index: 3;
}

.cyber-card:hover .card-border-glow {
  opacity: 1;
}

/* 可访问性 - 焦点状态 */
.cyber-card:focus {
  outline: none;
  border-color: hsl(var(--neon-cyan) / 0.5);
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 0 3px hsl(var(--neon-cyan) / 0.2),
    0 0 20px -6px hsl(var(--neon-cyan) / 0.3);
}

.cyber-card:focus-visible {
  outline: 2px solid hsl(var(--neon-cyan));
  outline-offset: 2px;
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .cyber-card {
    transition: none;
  }

  .cyber-card:hover {
    transform: none;
  }

  .cyber-card:focus {
    box-shadow: var(--site-card-shadow-hover);
  }
}
</style>
