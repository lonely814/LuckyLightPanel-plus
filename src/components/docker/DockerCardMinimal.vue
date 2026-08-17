<script setup lang="ts">
import { useDockerCard } from '@/composables/useDockerCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { Box } from 'lucide-vue-next'
import type { DockerContainer } from '@/types'

const props = defineProps<{
  container: DockerContainer
}>()

const {
  stats,
  containerState,
  stateConfig,
  displayName,
  iconUrl,
  cpuValue,
  minimalIconBgStyle
} = useDockerCard(props.container)
</script>

<template>
  <div class="card-inner-minimal">
    <div
      class="minimal-icon"
      :style="minimalIconBgStyle"
    >
      <CardIcon :icon-url="iconUrl" :alt="displayName">
        <Box class="icon-default-md" />
      </CardIcon>
      <!-- 状态指示器 -->
      <div
        class="minimal-status-dot"
        :class="stateConfig.class"
        :style="{ boxShadow: `0 0 8px hsl(${stateConfig.shadow} / 0.8)` }"
      />
    </div>
    <h3 class="minimal-title">{{ displayName }}</h3>
    <div v-if="stats && containerState === 'running'" class="minimal-stats">
      <span class="minimal-cpu" :style="{ color: stateConfig.color }">{{ cpuValue.toFixed(0) }}%</span>
    </div>
  </div>
</template>

<style scoped>
.card-inner-minimal {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.minimal-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  transition: transform 300ms var(--ease-spring);
  filter: brightness(var(--icon-brightness, 1));
  background: hsl(var(--icon-placeholder-bg));
}

.minimal-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--icon-overlay-opacity, 0));
  border-radius: inherit;
  pointer-events: none;
}

.docker-card:hover .minimal-icon {
  transform: scale(1.1);
}

.icon-default-md {
  width: 1.375rem;
  height: 1.375rem;
  color: white;
}

.minimal-status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid hsl(var(--card-bg));
}

.minimal-status-dot.status-running { background: hsl(var(--neon-green)); }
.minimal-status-dot.status-stopped { background: hsl(var(--error)); }
.minimal-status-dot.status-paused { background: hsl(var(--warning)); }
.minimal-status-dot.status-unknown { background: hsl(var(--text-muted)); }

.minimal-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  transition: color 300ms;
  line-height: 1.2;
}

.docker-card:hover .minimal-title {
  color: hsl(var(--docker-orange));
}

.minimal-stats {
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimal-cpu {
  font-size: 0.625rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
}
</style>