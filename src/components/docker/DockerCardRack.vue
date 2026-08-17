<script setup lang="ts">
import { useDockerCard } from '@/composables/useDockerCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { Cpu, MemoryStick, ArrowDownToLine, ArrowUpFromLine, Box, Zap } from 'lucide-vue-next'
import type { DockerContainer } from '@/types'

const props = defineProps<{
  container: DockerContainer
}>()

const {
  stats,
  statusDuration,
  stateConfig,
  displayName,
  iconUrl,
  cpuValue,
  isRunning,
  rackLedStyle,
  rackActLedStyle,
  rackIconBgStyle,
  formatSpeedShort
} = useDockerCard(props.container)
</script>

<template>
  <div class="card-inner-rack">
    <!-- 前面板顶盖装饰线 -->
    <div class="rack-top-edge" />
    <!-- 指示灯组 -->
    <div class="rack-leds">
      <span class="rack-led" :style="rackLedStyle" title="电源" />
      <span class="rack-led rack-led-act" :class="{ blink: isRunning }" :style="rackActLedStyle" title="活动" />
    </div>
    <!-- 图标/铭牌 -->
    <div class="rack-head">
      <div class="rack-icon" :style="rackIconBgStyle">
        <CardIcon :icon-url="iconUrl" :alt="displayName">
          <Box class="icon-default-sm" />
        </CardIcon>
      </div>
      <div class="rack-nameplate">
        <span class="rack-name">{{ displayName }}</span>
        <span v-if="container.description" class="rack-desc">{{ container.description }}</span>
      </div>
    </div>
    <!-- 状态读数 -->
    <div class="rack-status">
      <span class="rack-status-short" :style="{ color: stateConfig.color }">{{ stateConfig.shortText }}</span>
      <span v-if="statusDuration" class="rack-duration">{{ statusDuration }}</span>
    </div>
    <!-- 统计读数 -->
    <div v-if="stats && isRunning" class="rack-stats">
      <div class="rack-stat" title="CPU 使用率">
        <Cpu class="rack-stat-icon" :style="{ color: stateConfig.color }" />
        <span class="rack-stat-value">{{ cpuValue.toFixed(1) }}%</span>
      </div>
      <div class="rack-stat" title="内存使用">
        <MemoryStick class="rack-stat-icon mem" />
        <span class="rack-stat-value">{{ stats.memoryUsage?.split('/')[0] || '-' }}</span>
      </div>
      <div class="rack-stat" title="下载速度">
        <ArrowDownToLine class="rack-stat-icon" />
        <span class="rack-stat-value">{{ formatSpeedShort(stats.networkRxSpeed || 0) }}</span>
      </div>
      <div class="rack-stat" title="上传速度">
        <ArrowUpFromLine class="rack-stat-icon" />
        <span class="rack-stat-value">{{ formatSpeedShort(stats.networkTxSpeed || 0) }}</span>
      </div>
    </div>
    <div v-else class="rack-offline">
      <Zap class="rack-offline-icon" :style="{ color: stateConfig.color }" />
    </div>
    <!-- 面板把手 -->
    <div class="rack-handle" />
  </div>
</template>

<style scoped>
.card-inner-rack {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.625rem 0.75rem;
  min-height: 3.25rem;
  background:
    linear-gradient(90deg, hsl(var(--site-card-inner-glow)) 0%, transparent 30%),
    linear-gradient(180deg, hsl(var(--site-card-bg-hover)) 0%, hsl(var(--site-card-bg)) 100%);
}

.rack-top-edge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, hsl(var(--docker-orange) / 0.6), transparent);
  opacity: 0.6;
  pointer-events: none;
}

.rack-leds {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  padding: 0.25rem 0.375rem;
  border-radius: 0.375rem;
  background: hsl(var(--glass-bg));
}

.rack-led {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
}

.rack-led-act.blink {
  animation: rack-led-blink 1.2s ease-in-out infinite;
}

@keyframes rack-led-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}

.rack-head {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.rack-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  filter: brightness(var(--icon-brightness, 1));
  position: relative;
  background: hsl(var(--icon-placeholder-bg));
}

.rack-icon::after {
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

.rack-nameplate {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.rack-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
  letter-spacing: 0.02em;
  transition: color 300ms;
}

.docker-card:hover .rack-name {
  color: hsl(var(--docker-orange));
}

.rack-desc {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
}

.rack-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.rack-status-short {
  font-size: 0.6875rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  letter-spacing: 0.06em;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.25rem;
  background: hsl(var(--glass-bg));
  white-space: nowrap;
}

.rack-duration {
  font-size: 0.625rem;
  color: hsl(var(--text-muted));
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.rack-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.rack-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.rack-stat-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.rack-stat-icon.mem {
  color: hsl(var(--neon-purple));
}

.rack-stat-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  font-family: ui-monospace, monospace;
}

.rack-offline {
  flex-shrink: 0;
}

.rack-offline-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.5;
}

.rack-handle {
  width: 0.375rem;
  height: 1.75rem;
  border-radius: 0.1875rem;
  flex-shrink: 0;
  background:
    linear-gradient(180deg, hsl(var(--glass-border)) 0%, transparent 40%, transparent 60%, hsl(var(--glass-border)) 100%),
    hsl(var(--glass-bg));
  border: 1px solid hsl(var(--glass-border));
}

@media (max-width: 720px) {
  .card-inner-rack {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .rack-nameplate {
    flex: 1;
  }

  .rack-desc {
    display: none;
  }

  .rack-status {
    margin-left: auto;
  }

  .rack-stats {
    width: 100%;
    padding-left: 0.625rem;
    border-left: none;
  }

  .rack-handle {
    display: none;
  }
}

@media (max-width: 480px) {
  .rack-duration {
    display: none;
  }

  .rack-stats {
    gap: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rack-led-act.blink {
    animation: none;
  }
}
</style>