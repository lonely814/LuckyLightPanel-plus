<script setup lang="ts">
import { useDockerCard } from '@/composables/useDockerCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { Cpu, MemoryStick, ArrowDownToLine, ArrowUpFromLine, Box } from 'lucide-vue-next'
import type { DockerContainer } from '@/types'

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

const {
  stats,
  containerState,
  statusDuration,
  stateConfig,
  displayName,
  iconUrl,
  cpuValue,
  listIconBgStyle,
  formatSpeedShort
} = useDockerCard(props.container)
</script>

<template>
  <div class="card-inner-list">
    <div
      class="list-icon"
      :style="listIconBgStyle"
    >
      <CardIcon :icon-url="iconUrl" :alt="displayName">
        <Box class="icon-default-sm" />
      </CardIcon>
    </div>

    <div class="list-content">
      <h3 class="list-title">{{ displayName }}</h3>
      <p v-if="container.description" class="list-desc">{{ container.description }}</p>
    </div>

    <div class="list-status">
      <span
        class="list-status-badge"
        :style="{
          color: stateConfig.color,
          backgroundColor: stateConfig.bgColor,
          borderColor: stateConfig.borderColor,
          width: props.listMaxWidths?.status ? `${props.listMaxWidths.status}px` : 'auto'
        }"
      >
        <span
          class="status-dot-sm"
          :style="{ backgroundColor: stateConfig.color }"
        />
        {{ stateConfig.text }}
        <span v-if="statusDuration" class="status-duration-list">{{ statusDuration }}</span>
      </span>
    </div>

    <!-- 统计数据 -->
    <div v-if="stats && containerState === 'running'" class="list-stats">
      <div
        class="list-stat list-stat-cpu"
        title="CPU 使用率"
        :style="{ width: props.listMaxWidths?.cpu ? `${props.listMaxWidths.cpu}px` : 'auto' }"
      >
        <Cpu class="list-stat-icon" :style="{ color: stateConfig.color }" />
        <span class="list-stat-value">{{ cpuValue.toFixed(0) }}%</span>
      </div>
      <div
        class="list-stat list-stat-memory"
        title="内存使用"
        :style="{ width: props.listMaxWidths?.memory ? `${props.listMaxWidths.memory}px` : 'auto' }"
      >
        <MemoryStick class="list-stat-icon mem" />
        <span class="list-stat-value">{{ stats.memoryUsage?.split('/')[0] || '-' }}</span>
      </div>
      <div
        class="list-stat list-stat-rx network-down"
        title="下载速度"
        :style="{ width: props.listMaxWidths?.networkRx ? `${props.listMaxWidths.networkRx}px` : 'auto' }"
      >
        <ArrowDownToLine class="list-stat-icon" />
        <span class="list-stat-value">{{ formatSpeedShort(stats.networkRxSpeed || 0) }}</span>
      </div>
      <div
        class="list-stat list-stat-tx network-up"
        title="上传速度"
        :style="{ width: props.listMaxWidths?.networkTx ? `${props.listMaxWidths.networkTx}px` : 'auto' }"
      >
        <ArrowUpFromLine class="list-stat-icon" />
        <span class="list-stat-value">{{ formatSpeedShort(stats.networkTxSpeed || 0) }}</span>
      </div>
    </div>
    <div v-else class="list-stats-placeholder">
      <span class="offline-label" :style="{ color: stateConfig.color }">OFFLINE</span>
    </div>
  </div>
</template>

<style scoped>
.card-inner-list {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.list-icon {
  width: 2.5rem;
  height: 2.5rem;
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

.list-icon::after {
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

.list-content {
  flex: 1;
  min-width: 0;
}

.list-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 300ms;
}

.docker-card:hover .list-title {
  color: hsl(var(--docker-orange));
}

.list-desc {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.125rem;
}

.list-status {
  flex-shrink: 0;
}

.list-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  border: 1px solid;
  white-space: nowrap;
}

.status-duration-list {
  font-size: 0.625rem;
  opacity: 0.8;
  font-weight: 400;
}

.status-dot-sm {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 80px));
  gap: 0.5rem;
  flex-shrink: 0;
}

.list-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: hsl(var(--glass-bg));
  white-space: nowrap;
}

.list-stat.network-down {
  background: hsl(var(--neon-green) / 0.08);
}

.list-stat.network-up {
  background: hsl(var(--neon-blue) / 0.08);
}

.list-stat-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.list-stat-icon.mem {
  color: hsl(var(--neon-purple));
}

.list-stat.network-down .list-stat-icon {
  color: hsl(var(--neon-green));
}

.list-stat.network-up .list-stat-icon {
  color: hsl(var(--neon-blue));
}

.list-stat-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.list-stats-placeholder {
  min-width: 4rem;
  text-align: center;
}

.offline-label {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .card-inner-list {
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  .list-stats,
  .list-stats-placeholder {
    width: 100%;
    margin-top: 0.375rem;
    padding-top: 0.375rem;
    border-top: 1px solid hsl(var(--glass-border));
  }
}

@media (max-width: 480px) {
  .card-inner-list {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .list-content {
    flex: 1;
    min-width: 120px;
  }

  .list-status {
    flex-shrink: 0;
  }

  .list-stats,
  .list-stats-placeholder {
    width: 100%;
    margin-top: 0.25rem;
    padding-top: 0.25rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>