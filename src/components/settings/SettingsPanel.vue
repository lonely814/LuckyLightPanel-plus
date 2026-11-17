<script setup lang="ts">
import { computed } from 'vue'
import { DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui'
import { Check, Github, RotateCcw, X } from 'lucide-vue-next'
import { PRESET_BACKGROUNDS, useConfigStore } from '@/stores/config'
import type { UserConfig } from '@/types'

const configStore = useConfigStore()

const open = computed({
  get: () => configStore.settingsPanelOpen,
  set: (value: boolean) => configStore.toggleSettingsPanel(value)
})

const serverBackgrounds = computed(() => configStore.serverBackgrounds)

type DetailField = 'detailTextContrast' | 'detailRadiusScale' | 'detailGlassBlurScale' | 'detailGlassOpacityScale'

const DETAILS: { field: DetailField; label: string; min: number; max: number; hint: string }[] = [
  { field: 'detailTextContrast', label: '文字对比度', min: 80, max: 130, hint: '增强或减弱文字可读性' },
  { field: 'detailRadiusScale', label: '圆角大小', min: 60, max: 150, hint: '卡片与面板的圆润程度' },
  { field: 'detailGlassBlurScale', label: '玻璃模糊', min: 25, max: 200, hint: '毛玻璃背景模糊强度' },
  { field: 'detailGlassOpacityScale', label: '卡片不透明度', min: 50, max: 150, hint: '卡片与面板的透明程度' }
]

const TOGGLES: { field: 'showHeader' | 'showDescription' | 'showTime'; label: string; hint?: string }[] = [
  { field: 'showHeader', label: '显示页头', hint: '关闭后在页面右上角仍可打开设置' },
  { field: 'showDescription', label: '显示描述' },
  { field: 'showTime', label: '显示时间' }
]

function toggle(key: 'showHeader' | 'showDescription' | 'showTime' | 'detailReduceMotion') {
  configStore.updateConfig(key, !configStore.config[key])
}

function onRange(field: keyof UserConfig, event: Event, asNumber: boolean) {
  const raw = (event.target as HTMLInputElement).value
  configStore.updateConfig(field, asNumber ? Number(raw) : raw)
}

function resetDetails() {
  configStore.updateConfig('detailTextContrast', 100)
  configStore.updateConfig('detailRadiusScale', 100)
  configStore.updateConfig('detailGlassBlurScale', 100)
  configStore.updateConfig('detailGlassOpacityScale', 100)
  configStore.updateConfig('detailReduceMotion', false)
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]" />
      <DialogContent
        class="fixed top-1/2 left-1/2 z-50 flex max-h-[86vh] w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius-lg)] border border-line-strong bg-elevated shadow-[var(--shadow-card)]"
      >
        <div class="flex items-center justify-between border-b border-line px-4 py-3">
          <DialogTitle class="text-sm font-semibold text-fg">设置</DialogTitle>
          <button
            type="button"
            class="rounded-[var(--radius-sm)] p-1 text-fg-muted hover:bg-surface-hover hover:text-fg"
            aria-label="关闭设置"
            @click="open = false"
          >
            <X class="size-4" />
          </button>
        </div>

        <div class="space-y-5 overflow-y-auto px-4 py-4">
          <!-- 主题：只有浅色 / 深色 -->
          <section>
            <h3 class="mb-2 text-xs font-medium text-fg-subtle">主题</h3>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="mode in (['light', 'dark'] as const)"
                :key="mode"
                type="button"
                class="flex items-center justify-between rounded-[var(--radius-sm)] border px-3 py-2 text-sm"
                :class="configStore.theme === mode ? 'border-brand bg-brand/10 text-brand' : 'border-line text-fg-muted hover:text-fg'"
                @click="configStore.setTheme(mode)"
              >
                {{ mode === 'light' ? '浅色' : '深色' }}
                <Check v-if="configStore.theme === mode" class="size-3.5" />
              </button>
            </div>
          </section>

          <!-- 背景 -->
          <section>
            <h3 class="mb-2 text-xs font-medium text-fg-subtle">背景</h3>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="bg in PRESET_BACKGROUNDS"
                :key="bg.id"
                type="button"
                class="relative grid h-12 place-items-center rounded-[var(--radius-sm)] border text-[10px]"
                :class="configStore.config.background === bg.id ? 'border-brand' : 'border-line'"
                :style="{ background: bg.value }"
                :title="bg.name"
                :aria-label="`背景 ${bg.name}`"
                @click="configStore.setBackground(bg.id)"
              >
                <Check v-if="configStore.config.background === bg.id" class="size-3.5 text-white drop-shadow" />
              </button>
            </div>

            <template v-if="serverBackgrounds.length > 0">
              <h3 class="mt-3 mb-2 text-xs font-medium text-fg-subtle">服务器图片</h3>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="bg in serverBackgrounds"
                  :key="bg.id"
                  type="button"
                  class="relative grid h-12 place-items-center rounded-[var(--radius-sm)] border bg-cover bg-center"
                  :class="configStore.config.background === bg.id ? 'border-brand' : 'border-line'"
                  :style="{ backgroundImage: `url(${bg.value})` }"
                  :title="bg.name"
                  :aria-label="`背景 ${bg.name}`"
                  @click="configStore.setBackground(bg.id)"
                >
                  <Check v-if="configStore.config.background === bg.id" class="size-3.5 text-white drop-shadow" />
                </button>
              </div>
            </template>
          </section>

          <!-- 显示 -->
          <section class="space-y-2">
            <h3 class="text-xs font-medium text-fg-subtle">显示</h3>
            <label
              v-for="item in TOGGLES"
              :key="item.field"
              class="flex items-center justify-between gap-3 text-sm text-fg"
            >
              <span>{{ item.label }}</span>
              <input
                type="checkbox"
                class="size-4 accent-[hsl(var(--primary))]"
                :checked="configStore.config[item.field]"
                @change="toggle(item.field)"
              />
            </label>

            <label class="block text-sm text-fg">
              <span class="mb-1 flex items-center justify-between">
                布局比例
                <span class="text-xs text-fg-subtle">{{ Math.round(configStore.config.layoutScale * 100) }}%</span>
              </span>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                class="w-full accent-[hsl(var(--primary))]"
                :value="configStore.config.layoutScale"
                @input="onRange('layoutScale', $event, true)"
              />
            </label>

            <label class="block text-sm text-fg">
              <span class="mb-1 flex items-center justify-between">
                站点卡片尺寸
                <span class="text-xs text-fg-subtle">{{ Math.round(configStore.config.siteCardSize) }}%</span>
              </span>
              <input
                type="range"
                min="70"
                max="150"
                step="5"
                class="w-full accent-[hsl(var(--primary))]"
                :value="configStore.config.siteCardSize"
                @input="onRange('siteCardSize', $event, true)"
              />
            </label>
          </section>

          <!-- 细节 -->
          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-medium text-fg-subtle">细节（100% = 主题默认）</h3>
              <button type="button" class="text-xs text-fg-muted hover:text-fg" @click="resetDetails">还原</button>
            </div>
            <label v-for="item in DETAILS" :key="item.field" class="block text-sm text-fg">
              <span class="mb-1 flex items-center justify-between">
                {{ item.label }}
                <span class="text-xs text-fg-subtle">{{ configStore.config[item.field] }}%</span>
              </span>
              <input
                type="range"
                :min="item.min"
                :max="item.max"
                step="5"
                class="w-full accent-[hsl(var(--primary))]"
                :title="item.hint"
                :value="configStore.config[item.field]"
                @input="onRange(item.field, $event, true)"
              />
            </label>

            <label class="flex items-center justify-between gap-3 text-sm text-fg">
              <span>减弱动效</span>
              <input
                type="checkbox"
                class="size-4 accent-[hsl(var(--primary))]"
                :checked="configStore.config.detailReduceMotion"
                @change="toggle('detailReduceMotion')"
              />
            </label>
          </section>
        </div>

        <div class="flex items-center justify-between border-t border-line px-4 py-3">
          <button
            type="button"
            class="flex items-center gap-1.5 text-xs text-fg-muted hover:text-danger"
            @click="configStore.resetConfig()"
          >
            <RotateCcw class="size-3.5" />
            重置所有设置
          </button>
          <a
            href="https://github.com/gdy666/LuckyLightPanel"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg"
          >
            <Github class="size-3.5" />
            开源地址
          </a>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
