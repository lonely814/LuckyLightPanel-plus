import { computed, watch } from 'vue'
import { useConfigStore } from '@/stores/config'
import { pruneGroupSelection } from '@/utils/groups'
import type { Group, GroupSelection } from '@/types'

/**
 * 三域网格共用的「搜索 + 分组多选」逻辑。
 * match 决定搜索命中，groupKeyOf 取条目所属分组。
 */
export function useFilteredGroups<T>(options: {
  items: () => T[]
  groups: () => Group[]
  match: (item: T, keyword: string) => boolean
  groupKeyOf: (item: T) => string | undefined
}) {
  const configStore = useConfigStore()

  const keyword = computed(() => configStore.currentSearchKeyword.trim().toLowerCase())

  const filtered = computed(() => {
    const kw = keyword.value
    return kw ? options.items().filter(item => options.match(item, kw)) : options.items()
  })

  const selected = computed<string[]>(() => configStore.currentGroupArray)

  const prunable = computed(() => {
    const alive = new Set(options.items().map(options.groupKeyOf))
    return pruneGroupSelection(configStore.currentGroup, [...alive].filter((k): k is string => !!k))
  })

  watch(prunable, next => {
    if (next !== null) configStore.setCurrentGroup(next)
  }, { immediate: true })

  /** 有选中分组时只出一段（名称留空），否则按后端分组顺序分段 */
  const sections = computed(() => {
    if (selected.value.length > 0) {
      const picked = filtered.value.filter(item => {
        const key = options.groupKeyOf(item)
        return !!key && selected.value.includes(key)
      })
      return picked.length ? [{ key: '__selection__', name: '', items: picked }] : []
    }
    return options
      .groups()
      .map(group => ({
        key: group.key,
        name: group.name,
        items: filtered.value.filter(item => options.groupKeyOf(item) === group.key)
      }))
      .filter(section => section.items.length > 0)
  })

  const visibleGroups = computed<Group[]>(() => {
    const withItems = new Set(filtered.value.map(options.groupKeyOf))
    return options.groups().filter(group => withItems.has(group.key))
  })

  function setSelection(value: GroupSelection) {
    configStore.setCurrentGroup(value)
  }

  return { keyword, filtered, sections, visibleGroups, selected, setSelection }
}
