<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ArrowDown, ArrowUp, Copy, Check, Link2 } from 'lucide-vue-next'
import type { LuckyService } from '@/types'
import { useNavStore } from '@/stores/nav'
import { formatSpeed, formatTraffic } from '@/utils/format'
import IconTile from '@/components/common/IconTile.vue'
import Sparkline from '@/components/common/Sparkline.vue'

const props = defineProps<{ service: LuckyService; dense: boolean; showDescription: boolean }>()

const navStore = useNavStore()
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined

const stats = computed(() => navStore.getServiceStats(props.service.key))
const history = computed(() => navStore.getServiceHistory(props.service.key))

const state = computed(() => stats.value?.state ?? props.service.state ?? 'unknown')
const name = computed(() => props.service.displayName || props.service.name)
const addr = computed(() => stats.value?.publicAddr || props.service.publicAddr || '')
const icon = computed(() => {
  const raw = props.service.iconUrl
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `./backend/iconlibs/${raw}`
})

const TONE: Record<string, string> = {
  running: 'text-success',
  enabled: 'text-success',
  stopped: 'text-danger',
  disabled: 'text-danger',
  error: 'text-danger'
}
const STATE_TEXT: Record<string, string> = {
  running: '运行中',
  enabled: '已启用',
  stopped: '已停止',
  disabled: '已禁用',
  error: '异常'
}
const tone = computed(() => TONE[state.value] ?? 'text-fg-subtle')
const stateText = computed(() => STATE_TEXT[state.value] ?? '未知')

const tcp = computed(() => stats.value?.tcpCurrentConnections ?? 0)
const udp = computed(() => stats.value?.udpCurrentConnections ?? 0)
const trafficIn = computed(() => formatTraffic(stats.value?.trafficIn ?? 0))
const trafficOut = computed(() => formatTraffic(stats.value?.trafficOut ?? 0))
const inSpeed = computed(() => formatSpeed(stats.value?.inSpeed ?? 0))
const outSpeed = computed(() => formatSpeed(stats.value?.outSpeed ?? 0))

onUnmounted(() => clearTimeout(copyTimer))

async function copyAddr() {
  if (!addr.value) return
  try {
    await navigator.clipboard.writeText(addr.value)
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 2000)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="glass p-(--density-pad)">
    <div class="flex items-center gap-3">
      <IconTile :src="icon" :name="name" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-sm font-medium text-fg">{{ name }}</div>
        <div class="flex items-center gap-1.5 text-xs">
          <span :class="tone" class="font-medium">{{ stateText }}</span>
          <span v-if="!dense" class="text-fg-subtle">TCP {{ tcp }} / UDP {{ udp }}</span>
        </div>
      </div>
      <button
        v-if="addr"
        type="button"
        class="shrink-0 rounded-[var(--radius-sm)] p-1.5 text-fg-subtle transition-colors hover:text-brand"
        :aria-label="`复制 ${name} 地址`"
        @click="copyAddr"
      >
        <Check v-if="copied" class="size-4 text-success" />
        <Copy v-else class="size-4" />
      </button>
    </div>

    <p v-if="!dense && showDescription && service.description" class="mt-2 line-clamp-2 text-xs text-fg-subtle">
      {{ service.description }}
    </p>

    <div v-if="addr" class="mt-2 flex items-center gap-1 text-xs text-fg-subtle">
      <Link2 class="size-3 shrink-0" />
      <span class="truncate">{{ addr }}</span>
    </div>

    <div v-if="!dense" class="mt-3 flex items-end justify-between gap-3 text-xs text-fg-muted">
      <div class="min-w-0 space-y-0.5 whitespace-nowrap">
        <div>入 {{ trafficIn }}</div>
        <div>出 {{ trafficOut }}</div>
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-0.5"><ArrowDown class="size-3 text-success" />{{ inSpeed }}</span>
          <span class="flex items-center gap-0.5"><ArrowUp class="size-3 text-warning" />{{ outSpeed }}</span>
        </div>
      </div>
      <Sparkline class="shrink-0" :data="history?.inSpeed ?? []" :color="`hsl(var(--success))`" />
    </div>

    <div v-else class="mt-1 flex items-center gap-2 text-xs text-fg-subtle">
      <span class="flex items-center gap-1"><ArrowDown class="size-3 text-success" />{{ inSpeed }}</span>
      <span class="flex items-center gap-1"><ArrowUp class="size-3 text-warning" />{{ outSpeed }}</span>
    </div>
  </div>
</template>
