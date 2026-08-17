<script setup lang="ts">
import { useServiceCard } from '@/composables/useServiceCard'
import CardIcon from '@/components/common/CardIcon.vue'
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
  isActive,
  minimalIconBgStyle
} = useServiceCard(props.service)
</script>

<template>
  <div class="card-inner-minimal">
    <div
      class="minimal-icon"
      :style="minimalIconBgStyle"
    >
      <CardIcon :icon-url="iconUrl" :alt="displayName">
        <component :is="typeConfig.icon" class="icon-default-md" />
      </CardIcon>
      <!-- 状态指示器 -->
      <div
        class="minimal-status-dot"
        :class="stateConfig.class"
        :style="{ boxShadow: `0 0 8px hsl(${stateConfig.shadow} / 0.8)` }"
      />
    </div>
    <h3 class="minimal-title">{{ displayName }}</h3>
    <div v-if="stats && isActive" class="minimal-stats">
      <span class="minimal-type" :style="{ color: `hsl(${typeConfig.color})` }">{{ typeConfig.shortLabel }}</span>
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

.service-card:hover .minimal-icon {
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
.minimal-status-dot.status-stopped { background: hsl(var(--text-muted)); }
.minimal-status-dot.status-error { background: hsl(var(--error)); }
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

.service-card:hover .minimal-title {
  color: hsl(var(--neon-cyan));
}

.minimal-stats {
  display: flex;
  align-items: center;
  justify-content: center;
}

.minimal-type {
  font-size: 0.625rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
}
</style>