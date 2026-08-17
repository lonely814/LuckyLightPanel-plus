<script setup lang="ts">
import { computed } from 'vue'
import { useDockerCard } from '@/composables/useDockerCard'
import type { DockerContainer } from '@/types'
import DockerCardNormal from './DockerCardNormal.vue'
import DockerCardCompact from './DockerCardCompact.vue'
import DockerCardList from './DockerCardList.vue'
import DockerCardRack from './DockerCardRack.vue'
import DockerCardMinimal from './DockerCardMinimal.vue'

const props = defineProps<{
  container: DockerContainer
  listMaxWidths?: {
    status: number
    cpu: number
    memory: number
    networkRx: number
    networkTx: number
  }
}>()

const { layout, containerState, stateConfig, ariaLabel } = useDockerCard(props.container)

// 卡片类名
const cardClass = computed(() => {
  const classes = ['docker-card', 'group']
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
      :style="{ '--shadow-color': `hsl(${stateConfig.shadow})` }"
    />

    <!-- 边框发光线 -->
    <div
      class="card-border-glow"
      :style="{ borderColor: containerState === 'running' ? stateConfig.borderColor : 'transparent' }"
    />

    <!-- 背景装饰 -->
    <div
      class="card-bg-decor"
      :style="{ background: `linear-gradient(135deg, ${stateConfig.color}, hsl(var(--docker-orange)))` }"
    />

    <!-- ============ Normal 布局 - 详细信息 ============ -->
    <DockerCardNormal
      v-if="layout === 'normal'"
      :container="container"
    />

    <!-- ============ Compact 布局 - 紧凑信息 ============ -->
    <DockerCardCompact
      v-else-if="layout === 'compact'"
      :container="container"
    />

    <!-- ============ List 布局 - 横向列表 ============ -->
    <DockerCardList
      v-else-if="layout === 'list'"
      :container="container"
      :list-max-widths="listMaxWidths"
    />

    <!-- ============ Rack 布局 - 1U 前面板 ============ -->
    <DockerCardRack
      v-else-if="layout === 'rack'"
      :container="container"
    />

    <!-- ============ Minimal 布局 - 极简 ============ -->
    <DockerCardMinimal
      v-else
      :container="container"
    />
  </div>
</template>

<style scoped>
/* ============================================
   Docker 容器卡片外壳 - 公共部分
   各布局内部样式见对应子组件
   ============================================ */

/* 卡片基础容器 - 复用站点卡片磨砂样式 */
.docker-card {
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
.docker-card::before {
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

.docker-card:hover {
  transform: translateY(-4px) scale(1.01);
  background: hsl(var(--site-card-bg-hover));
  border-color: hsl(var(--site-card-border-hover));
  /* 橙色系发光 */
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 20px -6px hsl(var(--docker-orange) / 0.3),
    0 0 40px -10px hsl(var(--neon-purple) / 0.12);
}

.docker-card:hover::before {
  opacity: var(--site-card-shine-hover);
}

/* Normal 布局 */
.docker-card.layout-normal {
  padding: 1rem;
}

/* Compact 布局 */
.docker-card.layout-compact {
  padding: 0.75rem;
}

/* List 布局 */
.docker-card.layout-list {
  padding: 0.875rem 1rem;
  border-left: 3px solid transparent;
}

.docker-card.layout-list:hover {
  transform: translateY(-2px);
  border-left-color: hsl(var(--docker-orange));
}

/* Minimal 布局 */
.docker-card.layout-minimal {
  padding: 0.75rem 0.5rem;
  text-align: center;
}

.docker-card.layout-minimal:hover {
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
  box-shadow: 0 0 30px -8px var(--shadow-color), inset 0 0 20px -12px var(--shadow-color, hsl(var(--docker-orange) / 0.3));
}

.docker-card:hover .card-glow {
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

.docker-card:hover .card-bg-decor {
  opacity: 0.35;
}

/* 可访问性 - 焦点状态 */
.docker-card:focus {
  outline: none;
  border-color: hsl(var(--docker-orange) / 0.5);
  box-shadow:
    var(--site-card-shadow-hover),
    0 0 0 3px hsl(var(--docker-orange) / 0.2),
    0 0 20px -6px hsl(var(--docker-orange) / 0.3);
}

.docker-card:focus-visible {
  outline: 2px solid hsl(var(--docker-orange));
  outline-offset: 2px;
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .docker-card {
    transition: none;
  }

  .docker-card:hover {
    transform: none;
  }
}
</style>