<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => clearInterval(timer))

const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 9) return '早上好'
  if (hour >= 9 && hour < 12) return '上午好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  if (hour >= 18 && hour < 23) return '晚上好'
  return '夜深了，注意休息'
})

const dateText = computed(() => {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const d = now.value
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}`
})

const timeText = computed(() =>
  now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
)
</script>

<template>
  <div class="glass inline-flex flex-wrap items-baseline gap-2 px-3 py-2">
    <span class="text-xs text-fg-muted">{{ greeting }} · {{ dateText }}</span>
    <span class="font-mono text-sm tabular-nums text-fg">{{ timeText }}</span>
  </div>
</template>
