<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'
import { ArrowUpRight } from 'lucide-vue-next'
import SiteIcon from './SiteIcon.vue'
import type { Site } from '@/types'

defineProps<{
  site: Site
  iconUrl: string | null
  showDesc: boolean
}>()

const configStore = useConfigStore()

// 布局模式（父组件仅在非 minimal / rack / map 布局下渲染本组件）
const layout = computed(() => configStore.layout)

// 图标尺寸
const iconSize = computed<'sm' | 'md' | 'lg'>(() => {
  const l = layout.value
  if (l === 'list' || l === 'compact') return 'sm'
  if (l === 'large') return 'lg'
  return 'md'
})
</script>

<template>
  <!-- ========== Launcher 竖排（normal / large）：大图标托盘 + 下方名称 ========== -->
  <div
    v-if="layout !== 'compact' && layout !== 'list'"
    class="launcher-inner"
  >
    <!-- 大图标托盘 -->
    <SiteIcon :icon-url="iconUrl" :name="site.name" :size="iconSize" />
    <!-- 名称 + 描述 -->
    <div class="launcher-text">
      <h3 class="card-title" :class="[`title-${layout}`]">
        {{ site.name }}
      </h3>
      <p v-if="showDesc" class="card-desc">{{ site.description }}</p>
    </div>
    <!-- 外链指示 -->
    <ArrowUpRight class="external-icon launcher-external" />
  </div>

  <!-- ========== 横排（compact / list） ========== -->
  <div
    v-else
    class="card-inner"
    :class="{ 'layout-list': layout === 'list', 'layout-compact': layout === 'compact' }"
  >
    <!-- 图标 -->
    <SiteIcon :icon-url="iconUrl" :name="site.name" :size="iconSize" />

    <!-- 内容 -->
    <div class="card-content" :class="{ 'has-mt': layout !== 'list' && layout !== 'compact' }">
      <div class="title-row">
        <h3 class="card-title" :class="[`title-${layout}`]">
          {{ site.name }}
        </h3>
        <!-- 外链指示图标 -->
        <ArrowUpRight
          v-if="layout !== 'compact'"
          class="external-icon"
        />
      </div>

      <p
        v-if="showDesc && layout !== 'compact'"
        class="card-desc"
      >
        {{ site.description }}
      </p>
    </div>

    <!-- 外链图标 (List 模式) -->
    <div v-if="layout === 'list'" class="list-external-btn">
      <ArrowUpRight class="list-external-icon" />
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   Launcher 竖排（normal / large）
   ============================================ */

.launcher-inner {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  text-align: center;
}

.launcher-text {
  min-width: 0;
  max-width: 100%;
}

/* 名称 */
.launcher-inner .card-title {
  font-size: 0.8125rem;
}

.launcher-inner .title-large {
  font-size: 0.9375rem;
}

/* 描述 */
.launcher-inner .card-desc {
  margin-top: 0.25rem;
}

/* 大图标托盘 hover：放大 + 彩色光晕（覆盖内联 box-shadow） */
.launcher-inner:hover .site-icon {
  transform: scale(1.1) translateY(-3px);
  box-shadow:
    0 14px 30px -8px hsl(var(--neon-cyan) / 0.45),
    0 0 26px -6px hsl(var(--neon-cyan) / 0.35) !important;
}

.launcher-inner:hover .card-title {
  color: hsl(var(--neon-cyan));
  text-shadow: 0 0 12px hsl(var(--neon-cyan) / 0.4);
}

/* 外链箭头：hover 时出现在右上角 */
.launcher-external {
  position: absolute;
  top: -0.375rem;
  right: -0.375rem;
}

.launcher-inner:hover .launcher-external {
  opacity: 1;
  transform: translateX(0) translateY(0);
  color: hsl(var(--neon-cyan));
}

@media (prefers-reduced-motion: reduce) {
  .launcher-inner:hover .site-icon {
    transform: none;
  }
}

/* ============================================
   横排（compact / list）
   ============================================ */

/* 内容容器 */
.card-inner {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-inner.layout-list {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
}

.card-inner.layout-compact {
  gap: 0.375rem;
}

/* 图标 hover 效果 */
.card-inner:hover .neon-icon {
  transform: scale(1.1) rotate(-2deg);
  box-shadow:
    0 6px 20px -4px hsl(var(--neon-cyan) / 0.35),
    0 0 15px -3px hsl(var(--neon-cyan) / 0.25) !important;
}

/* Compact 模式图标 hover */
.card-inner.layout-compact:hover .neon-icon {
  transform: scale(1.08);
}

/* 卡片内容 */
.card-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.card-content.has-mt {
  margin-top: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title {
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 300ms ease, text-shadow 300ms ease;
  line-height: 1.3;
}

.card-inner:hover .card-title {
  color: hsl(var(--neon-cyan));
  text-shadow: 0 0 12px hsl(var(--neon-cyan) / 0.4);
}

.title-compact {
  font-size: 0.75rem;
}

.title-normal,
.title-list {
  font-size: 0.9375rem;
}

.title-large {
  font-size: 1rem;
}

/* 外链图标 */
.external-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--text-muted));
  opacity: 0;
  transform: translateX(-0.5rem);
  transition: all 300ms;
  flex-shrink: 0;
}

.card-inner:hover .external-icon {
  opacity: 1;
  transform: translateX(0);
  color: hsl(var(--neon-cyan));
}

/* 描述 */
.card-desc {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* List 模式外链按钮 */
.list-external-btn {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--glass-bg));
  border: 1px solid hsl(var(--glass-border));
  flex-shrink: 0;
  transition: all 300ms;
}

.card-inner:hover .list-external-btn {
  border-color: hsl(var(--neon-cyan) / 0.4);
  background: hsl(var(--neon-cyan) / 0.1);
}

.list-external-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--text-muted));
  transition: color 300ms;
}

.card-inner:hover .list-external-icon {
  color: hsl(var(--neon-cyan));
}
</style>
