<script setup lang="ts">
import { useServiceCard } from '@/composables/useServiceCard'
import CardIcon from '@/components/common/CardIcon.vue'
import Sparkline from '@/components/common/Sparkline.vue'
import { ArrowDownToLine, ArrowUpFromLine, Activity, Zap, Copy, Check, Wifi } from 'lucide-vue-next'
import type { LuckyService } from '@/types'

const props = defineProps<{
  service: LuckyService
}>()

const {
  stats,
  stateConfig,
  typeConfig,
  displayName,
  iconUrl,
  formatTraffic,
  formatSpeed,
  showSpeed,
  inSpeedHistory,
  outSpeedHistory,
  isActive,
  iconBgStyle,
  copied,
  copyToClipboard
} = useServiceCard(props.service)
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
            <component :is="typeConfig.icon" class="icon-default" />
          </CardIcon>
        </div>
        <div class="status-indicator" :class="stateConfig.class" />
      </div>

      <div class="header-content">
        <h3 class="card-title">{{ displayName }}</h3>
        <div class="status-row">
          <span
            class="type-badge"
            :style="{
              color: `hsl(${typeConfig.color})`,
              backgroundColor: `hsl(${typeConfig.color} / 0.1)`,
              borderColor: `hsl(${typeConfig.color} / 0.2)`
            }"
          >
            {{ typeConfig.label }}
          </span>
          <span
            class="status-badge"
            :style="{ color: stateConfig.color, backgroundColor: stateConfig.bgColor }"
          >
            {{ stateConfig.text }}
          </span>
          <Activity
            v-if="isActive"
            class="activity-icon animate-pulse"
            :style="{ color: stateConfig.color }"
          />
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div v-if="stats && isActive" class="stats-section">
      <!-- 连接数 -->
      <div
        v-if="stats.tcpCurrentConnections > 0 || stats.udpCurrentConnections > 0"
        class="connection-row"
      >
        <div class="connection-icon-box">
          <Zap class="connection-icon" />
        </div>
        <div class="connection-stats">
          <span v-if="stats.tcpCurrentConnections > 0" class="conn-item">
            <span class="conn-label">TCP:</span>
            <span class="conn-value">{{ stats.tcpCurrentConnections }}</span>
          </span>
          <span v-if="stats.udpCurrentConnections > 0" class="conn-item">
            <span class="conn-label">UDP:</span>
            <span class="conn-value">{{ stats.udpCurrentConnections }}</span>
          </span>
        </div>
      </div>

      <!-- 流量和速度 -->
      <div class="traffic-grid">
        <!-- 下行 -->
        <div class="stat-box stat-in">
          <div class="stat-header">
            <ArrowDownToLine class="stat-icon in-icon" />
            <span class="stat-label">IN</span>
          </div>
          <div class="stat-value in-value">
            {{ formatTraffic(stats.trafficIn || 0) }}
          </div>
          <div v-if="showSpeed" class="stat-speed in-speed">
            {{ formatSpeed(stats.inSpeed || 0) }}
          </div>
          <Sparkline class="stat-trend" :data="inSpeedHistory" color="hsl(var(--neon-green))" :height="20" />
        </div>

        <!-- 上行 -->
        <div class="stat-box stat-out">
          <div class="stat-header">
            <ArrowUpFromLine class="stat-icon out-icon" />
            <span class="stat-label">OUT</span>
          </div>
          <div class="stat-value out-value">
            {{ formatTraffic(stats.trafficOut || 0) }}
          </div>
          <div v-if="showSpeed" class="stat-speed out-speed">
            {{ formatSpeed(stats.outSpeed || 0) }}
          </div>
          <Sparkline class="stat-trend" :data="outSpeedHistory" color="hsl(var(--neon-blue))" :height="20" />
        </div>
      </div>

      <!-- 公网地址 (STUN) - 点击可复制 -->
      <div
        v-if="stats.publicAddr"
        class="public-addr-box"
        :title="copied ? '已复制' : '点击复制地址'"
        @click="copyToClipboard(stats.publicAddr, $event)"
      >
        <div class="addr-header">
          <Wifi class="addr-icon" />
          <span class="addr-label">Public</span>
          <Check v-if="copied" class="addr-copy-icon copied" />
          <Copy v-else class="addr-copy-icon" />
        </div>
        <p class="addr-value">{{ stats.publicAddr }}</p>
      </div>
    </div>

    <!-- 非活跃状态 -->
    <div v-else-if="!isActive" class="inactive-state">
      <div
        class="inactive-box"
        :style="{ backgroundColor: stateConfig.bgColor, borderColor: stateConfig.borderColor }"
      >
        <span class="inactive-text" :style="{ color: stateConfig.color }">服务未启用</span>
      </div>
    </div>

    <!-- 描述 -->
    <p v-if="service.description" class="card-desc">
      {{ service.description }}
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

.service-card:hover .icon-box {
  transform: scale(1.1) rotate(-2deg);
  box-shadow:
    0 6px 20px -4px hsl(var(--neon-green) / 0.35),
    0 0 15px -3px hsl(var(--neon-green) / 0.25);
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
.status-indicator.status-stopped { background: hsl(var(--text-muted)); }
.status-indicator.status-error { background: hsl(var(--error)); }
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

.service-card:hover .card-title {
  color: hsl(var(--neon-green));
  text-shadow: 0 0 12px hsl(var(--neon-green) / 0.4);
}

.status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.125rem;
  flex-wrap: wrap;
}

.type-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 500;
  border: 1px solid transparent;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
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

.connection-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.25rem;
}

.connection-icon-box {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: hsl(var(--warning) / 0.1);
}

.connection-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--warning));
}

.connection-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.conn-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.conn-label {
  color: hsl(var(--text-muted));
}

.conn-value {
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: hsl(var(--text-primary));
}

.traffic-grid {
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

.stat-in {
  background-color: hsl(var(--neon-green) / 0.1);
  border-color: hsl(var(--neon-green) / 0.2);
}

.stat-out {
  background-color: hsl(var(--neon-blue) / 0.1);
  border-color: hsl(var(--neon-blue) / 0.2);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.stat-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.in-icon {
  color: hsl(var(--neon-green));
}

.out-icon {
  color: hsl(var(--neon-blue));
}

.stat-label {
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.in-value {
  color: hsl(var(--neon-green));
}

.out-value {
  color: hsl(var(--neon-blue));
}

.stat-speed {
  font-size: 0.625rem;
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.in-speed {
  color: hsl(var(--neon-green) / 0.7);
}

.out-speed {
  color: hsl(var(--neon-blue) / 0.7);
}

.stat-trend {
  margin-top: 0.375rem;
}

.public-addr-box {
  border-radius: 0.75rem;
  padding: 0.625rem;
  background-color: hsl(var(--warning) / 0.1);
  border: 1px solid hsl(var(--warning) / 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.public-addr-box:hover {
  background-color: hsl(var(--warning) / 0.15);
  border-color: hsl(var(--warning) / 0.3);
}

.public-addr-box:active {
  transform: scale(0.99);
}

.addr-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.addr-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: hsl(var(--warning));
}

.addr-label {
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
  flex: 1;
}

.addr-copy-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: hsl(var(--text-muted));
  opacity: 0.6;
  transition: all 0.2s ease;
}

.public-addr-box:hover .addr-copy-icon {
  opacity: 1;
  color: hsl(var(--warning));
}

.addr-copy-icon.copied {
  color: hsl(var(--neon-green));
  opacity: 1;
}

.addr-value {
  font-size: 0.75rem;
  font-family: ui-monospace, monospace;
  color: hsl(var(--warning));
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inactive-state {
  margin-top: 0.5rem;
}

.inactive-box {
  border-radius: 0.75rem;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid transparent;
}

.inactive-text {
  font-size: 0.75rem;
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