<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, Cpu, MemoryStick } from 'lucide-vue-next'
import { DropdownMenuContent, DropdownMenuPortal, DropdownMenuRoot, DropdownMenuTrigger } from 'reka-ui'
import { useNavStore } from '@/stores/nav'
import { compactMemory, memoryToBytes, percentValue } from '@/utils/format'

const navStore = useNavStore()

interface Ranked {
  name: string
  value: number
  text: string
}

const running = computed(() =>
  Array.from(navStore.dockerStats.values()).filter(stat => stat.state === 'running')
)

function rank(pick: (stat: (typeof running.value)[number]) => number, text: (stat: (typeof running.value)[number]) => string): Ranked[] {
  return running.value
    .map(stat => ({ name: stat.displayName || stat.containerName, value: pick(stat), text: text(stat) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

const topCpu = computed(() => rank(stat => percentValue(stat.cpuPercent), stat => `${percentValue(stat.cpuPercent).toFixed(1)}%`))
const topMemory = computed(() =>
  rank(stat => memoryToBytes(stat.memoryUsage), stat => compactMemory(stat.memoryUsage))
)
const maxCpu = computed(() => Math.max(1, ...topCpu.value.map(item => item.value)))
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="flex items-center gap-1 text-xs text-fg-muted hover:text-fg">
      资源总览
      <ChevronDown class="size-3" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :side-offset="6"
        class="z-50 w-64 rounded-[var(--radius-md)] border border-line-strong bg-elevated p-3 shadow-[var(--shadow-card)]"
      >
        <p v-if="running.length === 0" class="py-2 text-center text-xs text-fg-subtle">暂无运行中的容器</p>
        <template v-else>
          <div class="mb-1 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
            <Cpu class="size-3.5 text-brand" />CPU TOP 5
          </div>
          <ul class="mb-3 space-y-1">
            <li v-for="item in topCpu" :key="item.name" class="text-xs">
              <div class="flex items-center justify-between gap-2">
                <span class="truncate text-fg">{{ item.name }}</span>
                <span class="shrink-0 text-fg-subtle">{{ item.text }}</span>
              </div>
              <div class="mt-0.5 h-1 rounded-full bg-line/40">
                <div class="h-full rounded-full bg-brand" :style="{ width: `${(item.value / maxCpu) * 100}%` }" />
              </div>
            </li>
          </ul>

          <div class="mb-1 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
            <MemoryStick class="size-3.5 text-warning" />内存 TOP 5
          </div>
          <ul class="space-y-1">
            <li v-for="item in topMemory" :key="item.name" class="flex items-center justify-between gap-2 text-xs">
              <span class="truncate text-fg">{{ item.name }}</span>
              <span class="shrink-0 text-fg-subtle">{{ item.text }}</span>
            </li>
          </ul>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
