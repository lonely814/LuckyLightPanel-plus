/**
 * 分组选择 - 纯函数模块
 * 处理多选（string[]）与单选/all 的规范化与存活校验
 */
import type { GroupSelection } from '@/types'

/** 规范化为数组（'all' 或空数组 → []） */
export function normalizeGroupSelection(selection: GroupSelection): string[] {
  if (selection === 'all') return []
  if (Array.isArray(selection)) return selection
  return selection ? [selection] : []
}

/**
 * 剔除已不存在的分组键。
 * 返回 null 表示无需变更；返回 'all' 表示选中项全部失效；否则返回存活数组。
 */
export function pruneGroupSelection(
  selection: GroupSelection,
  availableKeys: string[]
): GroupSelection | null {
  const selected = normalizeGroupSelection(selection)
  if (selected.length === 0) return null

  const alive = selected.filter(key => availableKeys.includes(key))
  if (alive.length === selected.length) return null
  return alive.length > 0 ? alive : 'all'
}
