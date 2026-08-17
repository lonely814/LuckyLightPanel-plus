<script setup lang="ts">
import { useServiceCard } from '@/composables/useServiceCard'
import CardIcon from '@/components/common/CardIcon.vue'
import { ArrowDownToLine, ArrowUpFromLine, Wifi, Copy, Check } from 'lucide-vue-next'
import type { LuckyService } from '@/types'

const props = defineProps<{
  service: LuckyService
  listMaxWidths?: {
    status: number
    type: number
    trafficIn: number
    trafficOut: number
  }
}>()

const {
  stats,
  stateConfig,
  typeConfig,
  displayName,
  iconUrl,
  formatTrafficShort,
  isActive,
  listIconBgStyle,
  copied,
  copyToClipboard
} = useServiceCard(props.service)
</script>

<template>
  <div class="card-inner-list">
    <div
      class="list-icon"
      :style="listIconBgStyle"
    >
      <CardIcon :icon-url="iconUrl" :alt="displayName">
        <component :is="typeConfig.icon" class="icon-default-sm" />
      </CardIcon>
    </div>

    <div class="list-content">
      <div class="list-title-row">
        <h3 class="list-title">{{ displayName }}</h3>
        <!-- STUN 公网地址 - 同行显示 -->
        <div
          v-if="stats?.publicAddr"
          class="list-public-addr"
          :title="copied ? '已复制' : '点击复制地址'"
          @click="copyToClipboard(stats.publicAddr, $event)"
        >
          <Wifi class="list-addr-icon" />
          <span class="list-addr-text">{{ stats.publicAddr }}</span>
          <Check v-if="copied" class="list-copy-icon copied" />
          <Copy v-else class="list-copy-icon" />
        </div>
      </div>
      <p v-if="service.description" class="list-desc">{{ service.description }}</p>
    </div>

    <div class="list-type">
      <span
        class="list-type-badge"
        :style="{
          color: `hsl(${typeConfig.color})`,
          backgroundColor: `hsl(${typeConfig.color} / 0.1)`,
          borderColor: `hsl(${typeConfig.color} / 0.2)`,
          width: props.listMaxWidths?.type ? `${props.listMaxWidths.type}px` : 'auto'
        }"
      >
        {{ typeConfig.label }}
      </span>
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
      </span>
    </div>

    <!-- 统计数据 -->
    <div v-if="stats && isActive" class="list-stats">
      <div
        class="list-stat list-stat-in network-down"
        title="入站流量"
        :style="{ width: props.listMaxWidths?.trafficIn ? `${props.listMaxWidths.trafficIn}px` : 'auto' }"
      >
        <ArrowDownToLine class="list-stat-icon" />
        <span class="list-stat-value">{{ formatTrafficShort(stats.trafficIn || 0) }}</span>
      </div>
      <div
        class="list-stat list-stat-out network-up"
        title="出站流量"
        :style="{ width: props.listMaxWidths?.trafficOut ? `${props.listMaxWidths.trafficOut}px` : 'auto' }"
      >
        <ArrowUpFromLine class="list-stat-icon" />
        <span class="list-stat-value">{{ formatTrafficShort(stats.trafficOut || 0) }}</span>
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

.list-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.service-card:hover .list-title {
  color: hsl(var(--neon-cyan));
}

.list-desc {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.125rem;
}

.list-public-addr {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  background: hsl(var(--warning) / 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.list-public-addr:hover {
  background: hsl(var(--warning) / 0.2);
}

.list-public-addr:active {
  transform: scale(0.98);
}

.list-addr-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: hsl(var(--warning));
  flex-shrink: 0;
}

.list-addr-text {
  font-size: 0.6875rem;
  font-family: ui-monospace, monospace;
  color: hsl(var(--warning));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-copy-icon {
  width: 0.6875rem;
  height: 0.6875rem;
  color: hsl(var(--text-muted));
  flex-shrink: 0;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.list-public-addr:hover .list-copy-icon {
  opacity: 1;
  color: hsl(var(--warning));
}

.list-copy-icon.copied {
  color: hsl(var(--neon-green));
  opacity: 1;
}

.list-type {
  flex-shrink: 0;
}

.list-type-badge {
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

.status-dot-sm {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(60px, 80px));
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