<script setup lang="ts">
import { computed } from 'vue'
import { useServiceCard } from '@/composables/useServiceCard'
import type { LuckyService } from '@/types'
import ServiceCardNormal from './ServiceCardNormal.vue'
import ServiceCardCompact from './ServiceCardCompact.vue'
import ServiceCardList from './ServiceCardList.vue'
import ServiceCardRack from './ServiceCardRack.vue'
import ServiceCardMinimal from './ServiceCardMinimal.vue'

const props = defineProps<{
  service: LuckyService
  listMaxWidths?: {
    status: number
    type: number
    trafficIn: number
    trafficOut: number
  }
}>()

const { layout, stateConfig, typeConfig, isActive, ariaLabel } = useServiceCard(props.service)

// 卡片类名
const cardClass = computed(() => {
  const classes = ['service-card', 'group']
  if (layout.value === 'list') classes.push('layout-list')
  else if (layout.value === 'minimal') classes.push('layout-minimal')
  else if (layout.value === 'compact') classes.push('layout-compact')
  else if (layout.value === 'rack') classes.push('layout-rack')
  else classes.push('layout-normal')
  return classes.join(' ')
})
</script>

<template>
  <div
    :class="cardClass"
    role="article"
    :aria-label="ariaLabel"
  >
    <!-- 霓虹边框效果 -->
    <div
      class="card-glow"
      :style="{ '--shadow-color': `hsl(${typeConfig.shadow})` }"
    />

    <!-- 边框发光线 -->
    <div
      class="card-border-glow"
      :style="{ borderColor: isActive ? stateConfig.borderColor : 'transparent' }"
    />

    <!-- 背景装饰 -->
    <div
      class="card-bg-decor"
      :style="{ background: `linear-gradient(135deg, hsl(${typeConfig.color}), hsl(var(--neon-cyan)))` }"
    />

    <!-- ============ Normal 布局 - 详细信息 ============ -->
    <ServiceCardNormal
      v-if="layout === 'normal'"
      :service="service"
    />

    <!-- ============ Compact 布局 - 紧凑信息 ============ -->
    <ServiceCardCompact
      v-else-if="layout === 'compact'"
      :service="service"
    />

    <!-- ============ List 布局 - 横向列表 ============ -->
    <ServiceCardList
      v-else-if="layout === 'list'"
      :service="service"
      :list-max-widths="listMaxWidths"
    />

    <!-- ============ Rack 布局 - 1U 前面板 ============ -->
    <ServiceCardRack
      v-else-if="layout === 'rack'"
      :service="service"
    />

    <!-- ============ Minimal 布局 - 极简 ============ -->
    <ServiceCardMinimal
      v-else
      :service="service"
    />
  </div>
</template>

<style scoped>
/* ============================================
   Lucky 服务卡片外壳 - 公共部分
   各布局内部样式见对应子组件
   ============================================ */

/* 卡片基础容器 - 复用站点卡片磨砂样式 */
.service-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: hsl(var(--site-card-bg));
  backdrop-filter: blur(var(--site-card-blur)) saturate(var(--site-card-saturation));
  -webkit-backdrop-filter: blur(var(--site-card-blur)) saturate(var(--site-card-saturation));
  border: 1px solid hsl(var(--site-card-border));
  box-shadow: var(--site-card-shadow);
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease,
    border-color 300ms ease,
    background 300ms ease;
}

/* 磨砂内层叠加 - 增强通透感 */
.service-card::before {
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

.service-card:hover {
  transform: translateY(-4px) scale(1.01);
  background: hsl(var(--site-card-bg-hover));
  border-color: hsl(var(--site-card-border-hover));
  /* 绿色系发光 */
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 20px -6px hsl(var(--neon-green) / 0.3),
    0 0 40px -10px hsl(var(--neon-cyan) / 0.12);
}

.service-card:hover::before {
  opacity: var(--site-card-shine-hover);
}

/* Normal 布局 */
.service-card.layout-normal {
  padding: 1rem;
}

/* Compact 布局 */
.service-card.layout-compact {
  padding: 0.75rem;
}

/* List 布局 */
.service-card.layout-list {
  padding: 0.875rem 1rem;
  border-left: 3px solid transparent;
}

.service-card.layout-list:hover {
  transform: translateY(-2px);
  border-left-color: hsl(var(--neon-green));
}

/* Minimal 布局 */
.service-card.layout-minimal {
  padding: 0.75rem 0.5rem;
  text-align: center;
}

.service-card.layout-minimal:hover {
  transform: translateY(-3px) scale(1.02);
}

/* 霓虹边框效果 */
.card-glow {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  opacity: 0;
  transition: opacity 500ms;
  pointer-events: none;
  box-shadow: 0 0 30px -8px var(--shadow-color), inset 0 0 20px -12px var(--shadow-color, hsl(var(--neon-cyan) / 0.3));
}

.service-card:hover .card-glow {
  opacity: 0.9;
}

/* 边框发光线 */
.card-border-glow {
  position: absolute;
  inset: 1px;
  border-radius: calc(var(--radius-lg) - 1px);
  border: 1px solid transparent;
  transition: border-color 300ms;
  pointer-events: none;
}

/* 背景装饰 */
.card-bg-decor {
  position: absolute;
  top: -5rem;
  right: -5rem;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0;
  transition: opacity 700ms;
  pointer-events: none;
}

.service-card:hover .card-bg-decor {
  opacity: 0.35;
}

/* 可访问性 - 焦点状态 */
.service-card:focus {
  outline: none;
  border-color: hsl(var(--neon-green) / 0.5);
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 0 3px hsl(var(--neon-green) / 0.2),
    0 0 20px -6px hsl(var(--neon-green) / 0.3);
}

.service-card:focus-visible {
  outline: 2px solid hsl(var(--neon-green));
  outline-offset: 2px;
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .service-card {
    transition: none;
  }

  .service-card:hover {
    transform: none;
  }
}
</style>