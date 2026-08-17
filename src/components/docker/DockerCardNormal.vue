<script setup lang="ts">
import { useDockerCard } from '@/composables/useDockerCard'
import CardIcon from '@/components/common/CardIcon.vue'
import Sparkline from '@/components/common/Sparkline.vue'
import { Cpu, MemoryStick, ArrowDownToLine, ArrowUpFromLine, Activity, Box } from 'lucide-vue-next'
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
  cpuHistory,
  memHistory,
  rxHistory,
  txHistory,
  iconBgStyle,
  formatSpeed
} = useDockerCard(props.container)
</script>

<template>
  <div class="card-inner">
    <!-- 头部：图标和名称 -->
    <div class="card-header">
      <div class="icon-wrapper">
        <div
          class="icon-box"
          :style="iconBgStyle"
        >
          <CardIcon :icon-url="iconUrl" :alt="displayName">
            <Box class="icon-default" />
          </CardIcon>
        </div>
        <div class="status-indicator" :class="stateConfig.class" />
      </div>

      <div class="header-content">
        <h3 class="card-title">{{ displayName }}</h3>
        <div class="status-row">
          <span
            class="status-badge"
            :style="{ color: stateConfig.color, backgroundColor: stateConfig.bgColor }"
          >
            {{ stateConfig.text }}
          </span>
          <span v-if="statusDuration" class="status-duration">
            {{ statusDuration }}
          </span>
          <Activity
            v-if="containerState === 'running'"
            class="activity-icon animate-pulse"
            :style="{ color: stateConfig.color }"
          />
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div v-if="stats && containerState === 'running'" class="stats-section">
      <div class="stats-grid">
        <!-- CPU -->
        <div
          class="stat-box"
          :style="{ backgroundColor: stateConfig.bgColor, borderColor: stateConfig.borderColor }"
        >
          <div class="stat-header">
            <Cpu class="stat-icon" :style="{ color: stateConfig.color }" />
            <span class="stat-label">CPU</span>
          </div>
          <div class="stat-value-row">
            <span class="stat-value" :style="{ color: stateConfig.color }">
              {{ cpuValue.toFixed(1) }}
            </span>
            <span class="stat-unit">%</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${Math.min(cpuValue, 100)}%`,
                background: `linear-gradient(90deg, ${stateConfig.color}, hsl(var(--docker-orange)))`
              }"
            />
          </div>
        </div>

        <!-- 内存 -->
        <div class="stat-box stat-memory">
          <div class="stat-header">
            <MemoryStick class="stat-icon mem-icon" />
            <span class="stat-label">MEM</span>
          </div>
          <div class="stat-value mem-value">
            {{ stats.memoryUsage || '-' }}
          </div>
        </div>
      </div>

      <!-- 网络速度 -->
      <div class="network-stats">
        <div class="network-item">
          <div class="network-icon-box download">
            <ArrowDownToLine class="network-icon" />
          </div>
          <span class="network-speed">
            {{ formatSpeed(stats.networkRxSpeed || 0) }}
          </span>
        </div>
        <div class="network-item">
          <span class="network-speed">
            {{ formatSpeed(stats.networkTxSpeed || 0) }}
          </span>
          <div class="network-icon-box upload">
            <ArrowUpFromLine class="network-icon" />
          </div>
        </div>
      </div>

      <!-- 实时走势图 -->
      <div class="trend-grid">
        <div class="trend-item">
          <span class="trend-label">CPU</span>
          <Sparkline :data="cpuHistory" :color="stateConfig.color" :height="22" />
        </div>
        <div class="trend-item">
          <span class="trend-label">MEM</span>
          <Sparkline :data="memHistory" color="hsl(var(--neon-purple))" :height="22" />
        </div>
        <div class="trend-item">
          <span class="trend-label">↓ 下行</span>
          <Sparkline :data="rxHistory" color="hsl(var(--neon-green))" :height="22" />
        </div>
        <div class="trend-item">
          <span class="trend-label">↑ 上行</span>
          <Sparkline :data="txHistory" color="hsl(var(--neon-blue))" :height="22" />
        </div>
      </div>
    </div>

    <!-- 非运行状态提示 -->
    <div v-else-if="containerState !== 'running'" class="stopped-state">
      <div
        class="stopped-box"
        :style="{ backgroundColor: stateConfig.bgColor, borderColor: stateConfig.borderColor }"
      >
        <span class="stopped-text" :style="{ color: stateConfig.color }">容器未运行</span>
        <span v-if="statusDuration" class="stopped-duration" :style="{ color: stateConfig.color }">
          · {{ statusDuration }}
        </span>
      </div>
    </div>

    <!-- 描述 -->
    <p v-if="container.description" class="card-desc">
      {{ container.description }}
    </p>
  </div>
</template>

<style scoped>
.card-inner {
  position: relative;
  z-index: 10;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.icon-wrapper {
  position: relative;
}

.icon-box {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  filter: brightness(var(--icon-brightness, 1));
  position: relative;
  background: hsl(var(--icon-placeholder-bg));
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 300ms ease;
}

.docker-card:hover .icon-box {
  transform: scale(1.1) rotate(-2deg);
  box-shadow:
    0 6px 20px -4px hsl(var(--docker-orange) / 0.35),
    0 0 15px -3px hsl(var(--docker-orange) / 0.25);
}

.icon-box::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, var(--icon-overlay-opacity, 0));
  border-radius: inherit;
  pointer-events: none;
}

.icon-default {
  width: 1.5rem;
  height: 1.5rem;
  color: white;
}

.status-indicator {
  position: absolute;
  bottom: -0.125rem;
  right: -0.125rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid hsl(var(--card-bg));
}

.status-indicator.status-running { background: hsl(var(--neon-green)); }
.status-indicator.status-stopped { background: hsl(var(--error)); }
.status-indicator.status-paused { background: hsl(var(--warning)); }
.status-indicator.status-unknown { background: hsl(var(--text-muted)); }

.header-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-weight: 600;
  font-size: 0.9375rem;
  color: hsl(var(--text-primary));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 300ms ease, text-shadow 300ms ease;
}

.docker-card:hover .card-title {
  color: hsl(var(--docker-orange));
  text-shadow: 0 0 12px hsl(var(--docker-orange) / 0.4);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.status-duration {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  font-weight: 400;
}

.activity-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.stat-box {
  border-radius: 0.75rem;
  padding: 0.625rem;
  border: 1px solid transparent;
  transition: all var(--duration-fast) ease;
}

.stat-memory {
  background-color: hsl(var(--neon-purple) / 0.1);
  border-color: hsl(var(--neon-purple) / 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.stat-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.mem-icon {
  color: hsl(var(--neon-purple));
}

.stat-label {
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.stat-unit {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}

.mem-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--neon-purple));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
}

.progress-bar {
  margin-top: 0.5rem;
  height: 0.25rem;
  border-radius: 9999px;
  overflow: hidden;
  background: hsl(var(--text-muted) / 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 500ms;
}

.network-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.network-icon-box {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.network-icon-box.download {
  background: hsl(var(--neon-green) / 0.1);
}

.network-icon-box.upload {
  background: hsl(var(--neon-blue) / 0.1);
}

.network-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.network-icon-box.download .network-icon {
  color: hsl(var(--neon-green));
}

.network-icon-box.upload .network-icon {
  color: hsl(var(--neon-blue));
}

.network-speed {
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
  font-weight: 500;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem 0.875rem;
  padding: 0.625rem 0.25rem 0;
  border-top: 1px solid hsl(var(--glass-border));
}

.trend-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.trend-label {
  font-size: 0.625rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  color: hsl(var(--text-muted));
}

.stopped-state {
  margin-top: 0.5rem;
}

.stopped-box {
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid transparent;
}

.stopped-text {
  font-size: 0.75rem;
}

.stopped-duration {
  font-size: 0.6875rem;
  opacity: 0.8;
  margin-left: 0.25rem;
}

.card-desc {
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>