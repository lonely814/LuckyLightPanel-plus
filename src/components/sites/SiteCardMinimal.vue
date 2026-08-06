<script setup lang="ts">
import SiteIcon from './SiteIcon.vue'
import type { Site } from '@/types'

defineProps<{
  site: Site
  iconUrl: string | null
}>()
</script>

<template>
  <div class="minimal-inner">
    <!-- 图标 -->
    <SiteIcon :icon-url="iconUrl" :name="site.name" size="minimal" />
    <!-- Hover 时显示的名称 -->
    <div class="minimal-name">
      <span>{{ site.name }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Minimal 内部容器 */
.minimal-inner {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

/* Minimal hover 效果（原 .cyber-card.layout-minimal:hover .minimal-icon） */
.minimal-inner:hover .minimal-icon {
  transform: scale(1.15) translateY(-4px);
  box-shadow:
    0 12px 24px -6px hsl(var(--neon-cyan) / 0.4),
    0 0 20px -4px hsl(var(--neon-cyan) / 0.3);
}

/* Minimal 名称 - hover 时从下方浮现 */
.minimal-name {
  position: absolute;
  bottom: -2rem;
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--glass-border));
  border-radius: 6px;
  padding: 4px 10px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 200ms ease;
  z-index: 100;
  pointer-events: none;
}

.minimal-name span {
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--text-primary));
}

.minimal-inner:hover .minimal-name {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Minimal 模式焦点状态（原 .cyber-card.layout-minimal:focus .minimal-icon） */
.minimal-inner:focus-within .minimal-icon {
  box-shadow:
    0 0 0 3px hsl(var(--neon-cyan) / 0.3),
    0 8px 20px -4px hsl(var(--neon-cyan) / 0.4);
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .minimal-inner:hover .minimal-icon {
    transform: none;
  }

  .minimal-inner:hover .minimal-name {
    opacity: 1;
    visibility: visible;
  }
}

/* 浅色主题适配 */
[data-theme="light"] .minimal-name {
  background: hsl(220 15% 98% / 0.95);
  border-color: hsl(220 15% 85%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .minimal-name span {
  color: hsl(220 45% 15%);
}
</style>
