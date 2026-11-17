<script setup lang="ts">
import { computed } from 'vue'
import { Search, LayoutGrid, Rows3, Check } from 'lucide-vue-next'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger
} from 'reka-ui'
import type { Group, GroupSelection, LayoutMode } from '@/types'
import { LAYOUT_IDS } from '@/types'
import { normalizeGroupSelection } from '@/utils/groups'

const props = defineProps<{
  groups: Group[]
  selection: GroupSelection
  search: string
  layout: LayoutMode
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:selection', value: GroupSelection): void
  (e: 'update:search', value: string): void
  (e: 'update:layout', value: LayoutMode): void
}>()

const selected = computed(() => normalizeGroupSelection(props.selection))
const allSelected = computed(() => selected.value.length === 0)

const LAYOUT_META: Record<LayoutMode, { label: string; icon: typeof LayoutGrid }> = {
  card: { label: '卡片', icon: LayoutGrid },
  compact: { label: '紧凑', icon: Rows3 }
}

function toggleGroup(key: string) {
  if (key === 'all') {
    emit('update:selection', 'all')
    return
  }
  const next = selected.value.includes(key)
    ? selected.value.filter(k => k !== key)
    : [...selected.value, key]
  emit('update:selection', next.length === 0 ? 'all' : next)
}

</script>

<template>
  <div class="mb-4 flex flex-wrap items-center gap-2">
    <label class="glass flex min-w-45 flex-1 items-center gap-2 px-3 py-1.5">
      <Search class="size-4 shrink-0 text-fg-subtle" />
      <input
        :value="props.search"
        :placeholder="props.placeholder ?? '搜索…'"
        class="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
        type="search"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </label>

    <DropdownMenuRoot v-if="props.groups.length > 0">
      <DropdownMenuTrigger
        class="glass flex items-center gap-2 px-3 py-1.5 text-sm text-fg hover:bg-surface-hover"
      >
        <span>
          {{ allSelected ? '全部分组' : selected.length === 1 ? (props.groups.find(g => g.key === selected[0])?.name ?? '1 个分组') : `${selected.length} 个分组` }}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          :side-offset="6"
          class="z-50 min-w-44 rounded-[var(--radius-md)] border border-line-strong bg-elevated p-1 shadow-[var(--shadow-card)]"
        >
          <DropdownMenuCheckboxItem
            :model-value="allSelected"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-fg outline-none data-highlighted:bg-surface-hover"
            @select.prevent="toggleGroup('all')"
          >
            全部
            <Check v-if="allSelected" class="size-3.5 text-brand" />
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            v-for="group in props.groups"
            :key="group.key"
            :model-value="selected.includes(group.key)"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-fg outline-none data-highlighted:bg-surface-hover"
            @select.prevent="toggleGroup(group.key)"
          >
            <span class="truncate">{{ group.name }}</span>
            <Check v-if="selected.includes(group.key)" class="size-3.5 shrink-0 text-brand" />
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <DropdownMenuRoot>
      <DropdownMenuTrigger
        class="glass flex items-center gap-2 px-3 py-1.5 text-sm text-fg hover:bg-surface-hover"
        :aria-label="`布局：${LAYOUT_META[props.layout].label}`"
      >
        <component :is="LAYOUT_META[props.layout].icon" class="size-4" />
        <span>{{ LAYOUT_META[props.layout].label }}</span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          :side-offset="6"
          class="z-50 min-w-32 rounded-[var(--radius-md)] border border-line-strong bg-elevated p-1 shadow-[var(--shadow-card)]"
        >
          <DropdownMenuItem
            v-for="mode in LAYOUT_IDS"
            :key="mode"
            class="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm text-fg outline-none data-highlighted:bg-surface-hover"
            @select="emit('update:layout', mode)"
          >
            {{ LAYOUT_META[mode].label }}
            <Check v-if="mode === props.layout" class="size-3.5 text-brand" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>
