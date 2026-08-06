<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 问候语（按时段）
const greeting = computed(() => {
  const h = now.value.getHours()
  if (h >= 5 && h < 9) return '早上好'
  if (h >= 9 && h < 12) return '上午好'
  if (h >= 12 && h < 14) return '中午好'
  if (h >= 14 && h < 18) return '下午好'
  if (h >= 18 && h < 23) return '晚上好'
  return '夜深了，注意休息'
})

const timeText = computed(() => {
  return now.value.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
})

const seconds = computed(() => {
  return now.value.getSeconds().toString().padStart(2, '0')
})

const dateText = computed(() => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const w = weekdays[now.value.getDay()]
  const y = now.value.getFullYear()
  const m = now.value.getMonth() + 1
  const d = now.value.getDate()
  return `${y}年${m}月${d}日 · 周${w}`
})

const isNight = computed(() => {
  const h = now.value.getHours()
  return h >= 19 || h < 6
})
</script>

<template>
  <div class="greeting-clock">
    <div class="gc-greeting">
      <span class="gc-greeting-text">{{ greeting }}</span>
      <span class="gc-greeting-sep">·</span>
      <span class="gc-date">{{ dateText }}</span>
    </div>

    <div class="gc-time">
      <span class="gc-time-value">{{ timeText }}</span>
      <span class="gc-seconds" :class="{ night: isNight }">{{ seconds }}</span>
    </div>
  </div>
</template>

<style scoped>
.greeting-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  padding: 0.5rem 0.75rem 0.5rem 0.25rem;
}

.gc-greeting {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.gc-greeting-text {
  font-weight: 600;
  letter-spacing: 0.08em;
  color: hsl(var(--text-secondary));
}

.gc-greeting-sep {
  color: hsl(var(--text-muted));
  opacity: 0.5;
}

.gc-date {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
  letter-spacing: 0.02em;
}

.gc-time {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-family: var(--font-mono, ui-monospace, monospace);
}

.gc-time-value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  line-height: 1.1;
  color: hsl(var(--text-primary));
  font-variant-numeric: tabular-nums;
}

.gc-seconds {
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--neon-cyan) / 0.9);
  font-variant-numeric: tabular-nums;
}

.gc-seconds.night {
  color: hsl(var(--neon-purple) / 0.85);
}

@media (min-width: 640px) {
  .gc-time-value {
    font-size: 2rem;
  }
}
</style>
