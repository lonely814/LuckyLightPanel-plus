<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import SiteIcon from './SiteIcon.vue'
import type { Site } from '@/types'

const props = defineProps<{
  site: Site
  iconUrl: string | null
  showDesc: boolean
}>()

// 站点是否启用
const isEnabled = computed(() => props.site.enable !== false)

// 机柜布局 LED 电源灯样式
const rackLedStyle = computed(() => {
  const active = isEnabled.value
  return {
    backgroundColor: active ? 'hsl(var(--neon-green))' : 'hsl(var(--text-muted))',
    boxShadow: active ? '0 0 6px hsl(var(--neon-green) / 0.9)' : 'none'
  }
})

// 机柜布局活动灯样式
const rackActLedStyle = computed(() => ({
  backgroundColor: 'hsl(var(--neon-cyan))',
  boxShadow: '0 0 6px hsl(var(--neon-cyan) / 0.9)'
}))
</script>

<template>
  <div class="card-inner-rack">
    <!-- 前面板顶盖装饰线 -->
    <div class="rack-top-edge" />
    <!-- 指示灯组 -->
    <div class="rack-leds">
      <span class="rack-led" :style="rackLedStyle" title="启用状态" />
      <span class="rack-led rack-led-act blink" :style="rackActLedStyle" title="在线" />
    </div>
    <!-- 图标/铭牌 -->
    <div class="rack-head">
      <SiteIcon :icon-url="iconUrl" :name="site.name" size="rack" />
      <div class="rack-nameplate">
        <span class="rack-name">{{ site.name }}</span>
        <span v-if="showDesc" class="rack-desc">{{ site.description }}</span>
      </div>
    </div>
    <!-- 外链指示 -->
    <div class="rack-open">
      <ArrowUpRight class="rack-open-icon" />
    </div>
    <!-- 面板把手 -->
    <div class="rack-handle" />
  </div>
</template>

<style scoped>
/* 机柜内前面板 */
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

/* 前面板顶部发光棱线 */
.rack-top-edge {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, hsl(var(--neon-cyan) / 0.6), transparent);
  opacity: 0.6;
  pointer-events: none;
}

/* 指示灯组 */
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
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

/* 铭牌区 */
.rack-head {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
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

.card-inner-rack:hover .rack-name {
  color: hsl(var(--neon-cyan));
}

.rack-desc {
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: ui-monospace, monospace;
}

/* 外链指示 */
.rack-open {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rack-open-icon {
  width: 1rem;
  height: 1rem;
  color: hsl(var(--text-muted));
  opacity: 0.6;
  transform: translateX(-0.25rem) translateY(0.25rem);
  transition: all 300ms;
}

.card-inner-rack:hover .rack-open-icon {
  opacity: 1;
  transform: translateX(0) translateY(0);
  color: hsl(var(--neon-cyan));
}

/* 面板把手 */
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

/* 机柜布局响应式 */
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

  .rack-open {
    margin-left: auto;
  }

  .rack-handle {
    display: none;
  }
}

@media (max-width: 480px) {
  .card-inner-rack {
    gap: 0.375rem;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .rack-led-act.blink {
    animation: none;
  }
}
</style>
