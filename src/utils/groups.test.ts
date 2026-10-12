import { describe, it, expect } from 'vitest'
import { normalizeGroupSelection, pruneGroupSelection } from './groups'

describe('normalizeGroupSelection', () => {
  it("'all' → 空数组", () => {
    expect(normalizeGroupSelection('all')).toEqual([])
  })

  it('数组原样返回', () => {
    expect(normalizeGroupSelection(['a', 'b'])).toEqual(['a', 'b'])
  })

  it('单字符串包成数组', () => {
    expect(normalizeGroupSelection('a')).toEqual(['a'])
  })
})

describe('pruneGroupSelection', () => {
  const available = ['apps', 'db', 'web']

  it('全部存活时不变更（关键回归：多选不应被重置）', () => {
    expect(pruneGroupSelection(['apps', 'db'], available)).toBeNull()
    expect(pruneGroupSelection('apps', available)).toBeNull()
  })

  it('部分失效时只剔除失效项', () => {
    expect(pruneGroupSelection(['apps', 'gone'], available)).toEqual(['apps'])
  })

  it('全部失效时回落 all', () => {
    expect(pruneGroupSelection(['gone', 'dead'], available)).toBe('all')
    expect(pruneGroupSelection('gone', available)).toBe('all')
  })

  it('all / 空数组不触发变更', () => {
    expect(pruneGroupSelection('all', available)).toBeNull()
    expect(pruneGroupSelection([], available)).toBeNull()
  })

  it('多选含存活项时不得回落 all（旧代码回归点）', () => {
    // 旧逻辑用 some(g => g.key === currentGroup)，数组恒不命中 → 误重置为 all
    expect(pruneGroupSelection(['apps', 'db'], available)).not.toBe('all')
  })
})
