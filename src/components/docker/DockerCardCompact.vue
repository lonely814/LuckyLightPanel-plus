<script setup lang="ts">
import { useDockerCard } from '@/composables/useDockerCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { Cpu, MemoryStick, Box, Zap } from 'lucide-vue-next'
import type { DockerContainer } from '@/types'

const props = defineProps<{
  container: DockerContainer
}>()

const {
  stats,
  containerState,
  statusDuration,
  stateConfig,
  displayName,
  iconUrl,
  cpuValue,
  compactIconBgStyle
} = useDockerCard(props.container)
</script>

<template>
  <div class="card-inner-compact">
    <div class="compact-header">
      <div
        class="compact-icon"
        :style="compactIconBgStyle"
      >
        <CardIcon :icon-url="iconUrl" :alt="displayName">
          <Box class="icon-default-sm" />
        </CardIcon>
      </div>
      <div class="compact-content">
        <h3 class="compact-title">{{ displayName }}</h3>
        <div class="compact-status">
          <span
            class="status-dot"
            :style="{ backgroundColor: stateConfig.color, boxShadow: `0 0 6px hsl(${stateConfig.shadow} / 0.6)` }"
          />
          <span class="status-text" :style="{ color: stateConfig.color }">{{ stateConfig.text }}</span>
          <span v-if="statusDuration" class="status-duration-compact">{{ statusDuration }}</span>
        </div>
      </div>
    </div>

    <!-- 简化统计 -->
    <div v-if="stats && containerState === 'running'" class="compact-stats">
      <div class="compact-stat">
        <Cpu class="compact-stat-icon" :style="{ color: stateConfig.color }" />
        <span class="compact-stat-value">{{ cpuValue.toFixed(0) }}%</span>
      </div>
      <div class="compact-stat">
        <MemoryStick class="compact-stat-icon mem" />
        <span class="compact-stat-value">{{ stats.memoryUsage?.split('/')[0] || '-' }}</span>
      </div>
    </div>
    <div v-else class="compact-offline">
      <Zap class="offline-icon" :style="{ color: stateConfig.color }" />
    </div>
  </div>
</template>

<style scoped>
.card-inner-compact {
  position: relative;
  z-index: 10;
}

.compact-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.compact-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  filter: brightness(var(--icon-brightness, 1));
  position: relative;
  background: hsl(var(--icon-placeholder-bg));
}

.compact-icon::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--icon-overlay-opacity, 0));
  border-radius: inherit;
  pointer-events: none;
}

.icon-default-sm {
  width: 1.125rem;
  height: 1.125rem;
  color: white;
}

.compact-content {
  flex: 1;
  min-width: 0;
}

.compact-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 300ms;
  line-height: 1.3;
}

.docker-card:hover .compact-title {
  color: hsl(var(--docker-orange));
}

.compact-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.125rem;
}

.status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  font-size: 0.6875rem;
  font-weight: 500;
}

.status-duration-compact {
  font-size: 0.625rem;
  color: hsl(var(--text-muted));
  margin-left: 0.25rem;
}

.compact-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.625rem;
  padding-top: 0.5rem;
  border-top: 1px solid hsl(var(--glass-border));
}

.compact-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.compact-stat-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.compact-stat-icon.mem {
  color: hsl(var(--neon-purple));
}

.compact-stat-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.compact-offline {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid hsl(var(--glass-border));
}

.offline-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.5;
}
</style>