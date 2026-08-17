<script setup lang="ts">
import { useServiceCard } from '@/composables/useServiceCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { ArrowDownToLine, ArrowUpFromLine, Wifi, Zap, Copy, Check } from 'lucide-vue-next'
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
  formatTrafficShort,
  isActive,
  compactIconBgStyle,
  copied,
  copyToClipboard
} = useServiceCard(props.service)
</script>

<template>
  <div class="card-inner-compact">
    <div class="compact-header">
      <div
        class="compact-icon"
        :style="compactIconBgStyle"
      >
        <CardIcon :icon-url="iconUrl" :alt="displayName">
          <component :is="typeConfig.icon" class="icon-default-sm" />
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
          <span class="type-text" :style="{ color: `hsl(${typeConfig.color})` }">{{ typeConfig.shortLabel }}</span>
        </div>
      </div>
    </div>

    <!-- 简化统计 -->
    <div v-if="stats && isActive" class="compact-stats">
      <!-- STUN 公网地址 -->
      <div
        v-if="stats.publicAddr"
        class="compact-addr"
        :title="copied ? '已复制' : '点击复制'"
        @click="copyToClipboard(stats.publicAddr, $event)"
      >
        <Wifi class="compact-addr-icon" />
        <span class="compact-addr-text">{{ stats.publicAddr }}</span>
        <Check v-if="copied" class="compact-copy-icon copied" />
        <Copy v-else class="compact-copy-icon" />
      </div>
      <!-- 流量统计 -->
      <template v-if="!stats.publicAddr">
        <div class="compact-stat">
          <ArrowDownToLine class="compact-stat-icon in" />
          <span class="compact-stat-value">{{ formatTrafficShort(stats.trafficIn || 0) }}</span>
        </div>
        <div class="compact-stat">
          <ArrowUpFromLine class="compact-stat-icon out" />
          <span class="compact-stat-value">{{ formatTrafficShort(stats.trafficOut || 0) }}</span>
        </div>
      </template>
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

.service-card:hover .compact-title {
  color: hsl(var(--neon-cyan));
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

.type-text {
  font-size: 0.625rem;
  font-weight: 600;
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

.compact-stat-icon.in {
  color: hsl(var(--neon-green));
}

.compact-stat-icon.out {
  color: hsl(var(--neon-blue));
}

.compact-stat-value {
  font-size: 0.6875rem;
  font-weight: 600;
  color: hsl(var(--text-secondary));
  font-family: ui-monospace, monospace;
  white-space: nowrap;
}

.compact-addr {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: hsl(var(--warning) / 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;
}

.compact-addr:hover {
  background: hsl(var(--warning) / 0.2);
}

.compact-addr:active {
  transform: scale(0.98);
}

.compact-addr-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: hsl(var(--warning));
  flex-shrink: 0;
}

.compact-addr-text {
  font-size: 0.6875rem;
  font-family: ui-monospace, monospace;
  color: hsl(var(--warning));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-copy-icon {
  width: 0.6875rem;
  height: 0.6875rem;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.compact-addr:hover .compact-copy-icon {
  opacity: 1;
  color: hsl(var(--warning));
}

.compact-copy-icon.copied {
  color: hsl(var(--neon-green));
  opacity: 1;
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