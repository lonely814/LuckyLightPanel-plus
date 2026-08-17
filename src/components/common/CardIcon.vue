<script setup lang="ts">
import { ref } from 'vue'

/**
 * 卡片通用图标 - 统一处理图标加载/骨架屏/加载失败回退
 * 尺寸由 slot 容器决定，本组件只负责 img 加载状态
 */
defineProps<{
  iconUrl: string | null
  alt?: string
}>()

const iconLoading = ref(true)
const iconError = ref(false)

function handleIconLoad() {
  iconLoading.value = false
}

function handleIconError(event: Event) {
  iconLoading.value = false
  iconError.value = true
  ;(event.target as HTMLImageElement).style.display = 'none'
}

defineExpose({ iconLoading, iconError })
</script>

<template>
  <template v-if="iconUrl">
    <!-- 加载骨架屏 -->
    <div v-if="iconLoading" class="icon-skeleton" />
    <img
      v-if="iconUrl && !iconError"
      :src="iconUrl"
      :alt="alt || ''"
      class="icon-img"
      loading="lazy"
      @load="handleIconLoad"
      @error="handleIconError"
    />
    <!-- 加载失败：回退到占位（调用方通过 slot 提供） -->
    <slot v-if="iconError" />
  </template>
  <!-- 无图标时显示默认占位（由调用方通过 slot 提供） -->
  <slot v-else />
</template>

<style scoped>
.icon-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    hsl(var(--glass-bg)) 25%,
    hsl(var(--glass-bg-hover)) 50%,
    hsl(var(--glass-bg)) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: inherit;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .icon-skeleton {
    animation: none;
  }
}
</style>
