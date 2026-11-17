<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, ArrowUp, MemoryStick } from 'lucide-vue-next'
import type { DockerContainer } from '@/types'
import { useNavStore } from '@/stores/nav'
import { compactMemory, dockerStatusDuration, formatSpeed, percentValue } from '@/utils/format'
import IconTile from '@/components/common/IconTile.vue'
import Sparkline from '@/components/common/Sparkline.vue'

const props = defineProps<{ container: DockerContainer; dense: boolean; showDescription: boolean }>()

const navStore = useNavStore()

const stats = computed(() => navStore.getContainerStats(props.container.containerName))
const history = computed(() => navStore.getContainerHistory(props.container.containerName))

const state = computed(() => stats.value?.state ?? props.container.state ?? 'unknown')
const name = computed(() => props.container.displayName || props.container.containerName)
const icon = computed(() => {
  const raw = props.container.iconUrl
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `./backend/iconlibs/${raw}`
})

const TONE: Record<string, string> = {
  running: 'text-success',
  exited: 'text-danger',
  dead: 'text-danger',
  paused: 'text-warning',
  restarting: 'text-warning'
}
const STATE_TEXT: Record<string, string> = {
  running: '运行中',
  exited: '已停止',
  dead: '已停止',
  paused: '已暂停',
  restarting: '重启中'
}
const tone = computed(() => TONE[state.value] ?? 'text-fg-subtle')
const stateText = computed(() => STATE_TEXT[state.value] ?? '未知')
const uptime = computed(() => dockerStatusDuration(stats.value?.status ?? props.container.status))

const cpu = computed(() => percentValue(stats.value?.cpuPercent))
const memoryText = computed(() => compactMemory(stats.value?.memoryUsage))
const rx = computed(() => formatSpeed(stats.value?.networkRxSpeed ?? 0))
const tx = computed(() => formatSpeed(stats.value?.networkTxSpeed ?? 0))
</script>

<template>
  <div class="glass p-(--density-pad)">
    <div class="flex items-center gap-3">
      <IconTile :src="icon" :name="name" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium text-fg">{{ name }}</div>
        <div class="flex items-center gap-1.5 text-xs">
          <span :class="tone" class="font-medium">{{ stateText }}</span>
          <span v-if="uptime" class="truncate text-fg-subtle">{{ uptime }}</span>
        </div>
      </div>
      <div v-if="!dense" class="text-right text-xs text-fg-subtle">CPU {{ cpu.toFixed(1) }}%</div>
    </div>

    <p v-if="!dense && showDescription && container.description" class="mt-2 line-clamp-2 text-xs text-fg-subtle">
      {{ container.description }}
    </p>

    <div v-if="!dense" class="mt-3 flex items-end justify-between gap-3">
      <div class="flex items-center gap-1 text-xs text-fg-muted">
        <MemoryStick class="size-3" />{{ memoryText }}
      </div>
      <Sparkline :data="history?.cpu ?? []" :color="`hsl(var(--primary))`" />
    </div>

    <div class="mt-2 flex items-center gap-3 text-xs text-fg-subtle">
      <span class="flex items-center gap-1"><ArrowDown class="size-3 text-success" />{{ rx }}</span>
      <span class="flex items-center gap-1"><ArrowUp class="size-3 text-warning" />{{ tx }}</span>
    </div>
  </div>
</template>
