<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: number[]
  color?: string
  width?: number
  height?: number
}>(), {
  color: 'hsl(var(--neon-cyan))',
  width: 100,
  height: 26
})

// 生成折线点集
const points = computed(() => {
  const data = props.data
  if (!data || data.length === 0) return ''

  const w = props.width
  const h = props.height
  const pad = 2

  // 单点数据：画在中间
  if (data.length === 1) {
    return `${w},${h / 2}`
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - pad - ((v - min) / range) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    class="sparkline"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    :style="{ '--spark-color': color }"
  >
    <polyline
      class="sparkline-line"
      :points="points"
      fill="none"
      stroke="var(--spark-color)"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.sparkline {
  display: block;
  width: 100%;
  overflow: visible;
}

.sparkline-line {
  filter: drop-shadow(0 0 2px var(--spark-color));
}
</style>
