<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import SiteIcon from './SiteIcon.vue'
import type { Site } from '@/types'

const props = defineProps<{
  site: Site
  iconUrl: string | null
  showDesc: boolean
}>()

// 站点链接数量（用于地铁换乘站判定）
const linkCount = computed(() => {
  const { frontendUrls = [], backendUrls = [] } = props.site
  return [...frontendUrls, ...backendUrls].filter(u => u && u.trim()).length
})

// 是否换乘站（有多个链接）
const isTransfer = computed(() => linkCount.value > 1)
</script>

<template>
  <div class="card-inner-map">
    <!-- 站台圆点（坐在地铁线上） -->
    <span
      class="map-station"
      :class="{ transfer: isTransfer }"
      :title="isTransfer ? '换乘站：多个链接' : '站点'"
    />
    <!-- 站点图标 -->
    <SiteIcon :icon-url="iconUrl" :name="site.name" size="map" />
    <!-- 站名 -->
    <div class="map-label">
      <span class="map-name">{{ site.name }}</span>
      <span v-if="showDesc" class="map-desc">{{ site.description }}</span>
    </div>
    <!-- 外链指示 -->
    <ArrowUpRight class="map-arrow" />
  </div>
</template>

<style scoped>
/* 站台行 */
.card-inner-map {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.875rem 0.375rem 2.75rem;
  min-height: 2.75rem;
}

/* 站台圆点 - 坐在地铁线上 */
.map-station {
  position: absolute;
  left: 1.0625rem;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background: hsl(var(--map-line, var(--neon-cyan)));
  box-shadow:
    0 0 0 3px hsl(var(--map-line, var(--neon-cyan)) / 0.15),
    0 0 12px hsl(var(--map-line, var(--neon-cyan)) / 0.5);
  transition:
    transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
  z-index: 2;
}

/* 换乘站 - 空心双环 */
.map-station.transfer {
  background: transparent;
  border: 2px solid hsl(var(--map-line, var(--neon-cyan)));
  box-shadow:
    inset 0 0 0 2px hsl(var(--map-line, var(--neon-cyan)) / 0.2),
    0 0 12px hsl(var(--map-line, var(--neon-cyan)) / 0.5);
}

.card-inner-map:hover .map-station {
  transform: translate(-50%, -50%) scale(1.35);
  box-shadow:
    0 0 0 5px hsl(var(--map-line, var(--neon-cyan)) / 0.2),
    0 0 18px hsl(var(--map-line, var(--neon-cyan)) / 0.8);
}

/* 站名 */
.map-label {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  z-index: 2;
}

.map-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
  letter-spacing: 0.02em;
  transition: color 300ms, text-shadow 300ms;
}

.card-inner-map:hover .map-name {
  color: hsl(var(--neon-cyan));
  text-shadow: 0 0 12px hsl(var(--neon-cyan) / 0.4);
}

.map-desc {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
}

/* 外链箭头 */
.map-arrow {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--text-muted));
  opacity: 0;
  transform: translateX(-0.25rem) translateY(0.25rem);
  transition: all 300ms;
  flex-shrink: 0;
  z-index: 2;
}

.card-inner-map:hover .map-arrow {
  opacity: 1;
  transform: translateX(0) translateY(0);
  color: hsl(var(--neon-cyan));
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .card-inner-map:hover .map-station {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
