<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, ExternalLink } from 'lucide-vue-next'
import { DropdownMenuContent, DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuPortal } from 'reka-ui'
import type { Site } from '@/types'
import { getBestUrl, getLinkChoices, resolveSiteIcon, toSiteLinks } from '@/utils/siteLinks'
import IconTile from '@/components/common/IconTile.vue'

const props = defineProps<{
  site: Site
  effectiveType: 'internal' | 'external' | 'hybrid'
  showDescription: boolean
}>()

const links = computed(() => toSiteLinks(props.site))
const choices = computed(() => getLinkChoices(links.value, props.effectiveType))
const multiple = computed(() => choices.value.length > 1)
const icon = computed(() => resolveSiteIcon(props.site.iconUrl, links.value, props.effectiveType))

function open(url: string) {
  const win = window.open(url, props.site.target || '_blank')
  if (win) win.opener = null
}

const singleHref = computed(() => (multiple.value ? null : getBestUrl(links.value, props.effectiveType) ?? '#'))
</script>

<template>
  <component
    :is="multiple ? 'div' : 'a'"
    v-bind="multiple ? {} : { href: singleHref ?? '#', target: props.site.target || '_blank', rel: 'noopener noreferrer' }"
    class="group glass flex items-center gap-3 p-(--density-pad) transition-colors hover:bg-surface-hover"
    :aria-label="props.site.name"
  >
    <IconTile :src="icon" :name="props.site.name" />

    <div class="min-w-0 flex-1">
      <div class="truncate text-sm font-medium text-fg">{{ props.site.name }}</div>
      <div v-if="props.showDescription && props.site.description" class="truncate text-xs text-fg-subtle">
        {{ props.site.description }}
      </div>
    </div>

    <DropdownMenuRoot v-if="multiple">
      <DropdownMenuTrigger
        class="flex shrink-0 items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-fg-muted hover:bg-surface"
        :aria-label="`打开 ${props.site.name} 的 ${choices.length} 个链接`"
      >
        {{ choices.length }} 链接
        <ChevronDown class="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          :side-offset="6"
          class="z-50 max-w-64 min-w-44 rounded-[var(--radius-md)] border border-line-strong bg-elevated p-1 shadow-[var(--shadow-card)]"
        >
          <DropdownMenuItem
            v-for="item in choices"
            :key="item.url"
            class="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-fg outline-none data-highlighted:bg-surface-hover"
            @select="open(item.url)"
          >
            <span class="shrink-0 text-[10px] uppercase text-fg-subtle">{{ item.type === 'internal' ? '内' : '外' }}</span>
            <span class="truncate">{{ item.label }}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <ExternalLink v-else class="size-4 shrink-0 text-fg-subtle transition-colors group-hover:text-brand" />
  </component>
</template>
