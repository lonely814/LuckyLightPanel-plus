<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    data: number[]
    color?: string
    width?: number
    height?: number
  }>(),
  { color: 'hsl(var(--primary))', width: 96, height: 24 }
)

/** 归一化到 viewBox 的点集；单点画在中线 */
const points = computed(() => {
  const data = props.data
  if (!data?.length) return ''

  const w = props.width
  const h = props.height
  const pad = 2
  if (data.length === 1) return `${w},${h / 2}`

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  return data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * w
      const y = h - pad - ((value - min) / range) * (h - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
})
</script>

<template>
  <svg
    class="block h-6 w-24 shrink-0 overflow-visible opacity-80"
    :width="props.width"
    :height="props.height"
    :viewBox="`0 0 ${props.width} ${props.height}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <!-- 单点 polyline 不渲染，落一个圆点兜底 -->
    <circle
      v-if="props.data.length === 1"
      :cx="props.width / 2"
      :cy="props.height / 2"
      r="2"
      :fill="props.color"
    />
    <polyline
      v-else
      :points="points"
      fill="none"
      :stroke="props.color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
