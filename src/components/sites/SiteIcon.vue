<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  iconUrl: string | null
  name: string
  size: 'sm' | 'md' | 'lg' | 'minimal' | 'rack' | 'map'
}>()

// 图标加载状态
const iconLoading = ref(true)
const iconError = ref(false)

function handleIconLoad() {
  iconLoading.value = false
}

function handleIconError() {
  iconLoading.value = false
  iconError.value = true
}

// 霓虹渐变色组（用于无图标时的首字母背景）
const neonGradients = [
  { from: 'var(--neon-cyan)', to: 'var(--neon-blue)', shadow: 'var(--neon-cyan)' },
  { from: 'var(--neon-purple)', to: 'var(--neon-blue)', shadow: 'var(--neon-purple)' },
  { from: 'var(--neon-green)', to: 'var(--neon-cyan)', shadow: 'var(--neon-green)' },
  { from: 'var(--neon-blue)', to: 'var(--neon-purple)', shadow: 'var(--neon-blue)' },
  { from: 'var(--neon-cyan)', to: 'var(--neon-green)', shadow: 'var(--neon-cyan)' }
]

// 无图标/加载失败时的渐变色（基于名称首字母）
const fallbackGradient = computed(() => {
  const index = props.name.charCodeAt(0) % neonGradients.length
  return neonGradients[index]
})

// 图标背景样式
const iconBgStyle = computed(() => {
  if (props.iconUrl && !iconError.value) {
    // 有图标：使用主题适配的中性背景
    return {
      boxShadow: '0 4px 20px -4px hsl(var(--icon-placeholder-bg) / 0.5)'
    }
  }
  // 无图标或加载失败：使用彩色渐变背景
  return {
    background: `linear-gradient(135deg, hsl(${fallbackGradient.value.from}) 0%, hsl(${fallbackGradient.value.to}) 100%)`,
    boxShadow: `0 4px 20px -4px hsl(${fallbackGradient.value.shadow} / 0.5)`
  }
})

// 布局尺寸映射为原类名（保持与主题 CSS 的兼容）
const iconClass = computed(() => {
  switch (props.size) {
    case 'minimal':
      return 'site-icon minimal-icon'
    case 'rack':
      return 'site-icon rack-icon'
    case 'map':
      return 'site-icon map-icon'
    case 'sm':
      return 'site-icon neon-icon size-sm'
    case 'lg':
      return 'site-icon neon-icon size-lg'
    default:
      return 'site-icon neon-icon size-md'
  }
})
</script>

<template>
  <div :class="iconClass" :style="iconBgStyle">
    <!-- 加载骨架屏 -->
    <div v-if="iconLoading && iconUrl && !iconError" class="icon-skeleton" />
    <img
      v-if="iconUrl && !iconError"
      :src="iconUrl"
      :alt="name"
      class="icon-img"
      loading="lazy"
      @load="handleIconLoad"
      @error="handleIconError"
    />
    <!-- 无图标或加载失败：首字母占位 -->
    <span v-else class="icon-text">
      {{ name.charAt(0).toUpperCase() }}
    </span>
  </div>
</template>

<style scoped>
.site-icon {
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  filter: brightness(var(--icon-brightness, 1));
  background: hsl(var(--icon-placeholder-bg));
}

/* 深色模式下的图标蒙版 */
.site-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--icon-overlay-opacity, 0));
  border-radius: inherit;
  pointer-events: none;
}

/* 默认布局尺寸 */
.neon-icon.size-sm {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
}

/* Launcher 竖排（normal）大图标托盘 */
.neon-icon.size-md {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
}

/* Launcher 竖排（large）超大图标托盘 */
.neon-icon.size-lg {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 1.5rem;
}

/* Minimal 布局图标 */
.minimal-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
}

.minimal-icon .icon-text {
  font-size: 1.125rem;
}

/* Rack 布局图标 */
.rack-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
}

.rack-icon .icon-text {
  font-size: 0.875rem;
}

/* Map 布局图标 */
.map-icon {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
}

.map-icon .icon-text {
  font-size: 0.75rem;
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 图标加载骨架屏 */
.icon-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: inherit;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.icon-text {
  color: white;
  font-weight: 700;
}

/* Large 布局首字母放大 */
.neon-icon.size-md .icon-text {
  font-size: 1rem;
}

.neon-icon.size-lg .icon-text {
  font-size: 1.375rem;
}

@media (prefers-reduced-motion: reduce) {
  .icon-skeleton {
    animation: none;
  }
}
</style>
