import { describe, it, expect } from 'vitest'
import { DEFAULT_CONFIG, normalizeConfig } from './config'

describe('normalizeConfig —— 旧版本地配置迁移', () => {
  it('旧 9 套主题收敛到 light / dark', () => {
    const cases: Record<string, string> = {
      light: 'light',
      dark: 'dark',
      blueprint: 'dark',
      bauhaus: 'dark',
      'crt-terminal': 'dark',
      console: 'dark',
      'arctic-aurora': 'dark',
      'light-panel': 'light',
      receipt: 'light'
    }
    for (const [legacy, expected] of Object.entries(cases)) {
      expect(normalizeConfig({ theme: legacy }).theme).toBe(expected)
    }
  })

  it('旧 7 种布局收敛到 card / compact', () => {
    const cases: Record<string, string> = {
      normal: 'card',
      large: 'card',
      list: 'compact',
      minimal: 'compact',
      rack: 'compact',
      map: 'compact',
      compact: 'compact',
      card: 'card'
    }
    for (const [legacy, expected] of Object.entries(cases)) {
      expect(normalizeConfig({ layout: legacy }).layout).toBe(expected)
      expect(normalizeConfig({ dockerLayout: legacy }).dockerLayout).toBe(expected)
      expect(normalizeConfig({ luckyServicesLayout: legacy }).luckyServicesLayout).toBe(expected)
    }
  })

  it('未知主题/布局回落到默认值', () => {
    expect(normalizeConfig({ theme: 'nonsense', layout: 'nonsense' }).theme).toBe(DEFAULT_CONFIG.theme)
    expect(normalizeConfig({ layout: 'nonsense' }).layout).toBe(DEFAULT_CONFIG.layout)
  })

  it('tabGroups 的三种历史形态统一为 all | string[]', () => {
    expect(normalizeConfig({ tabGroups: { sites: 'all', docker: 'apps', luckyServices: ['a', 'b'] } }).tabGroups).toEqual({
      sites: 'all',
      docker: ['apps'],
      luckyServices: ['a', 'b']
    })
    // 缺键补 all
    expect(normalizeConfig({ tabGroups: { sites: ['x'] } }).tabGroups).toEqual({
      sites: ['x'],
      docker: 'all',
      luckyServices: 'all'
    })
    // 非字符串数组元素被剔除
    expect(normalizeConfig({ tabGroups: { sites: ['x', 1, null] } }).tabGroups.sites).toEqual(['x'])
  })

  it('非法 currentTab 回落 sites', () => {
    expect(normalizeConfig({ currentTab: 'unknown' }).currentTab).toBe('sites')
    expect(normalizeConfig({ currentTab: 'docker' }).currentTab).toBe('docker')
  })

  it('数值字段被解析，非法值用默认值', () => {
    const cfg = normalizeConfig({ siteCardSize: '120', detailTextContrast: 'oops' })
    expect(cfg.siteCardSize).toBe(120)
    expect(cfg.detailTextContrast).toBe(DEFAULT_CONFIG.detailTextContrast)
  })

  it('非法 networkMode 回落 hybrid', () => {
    expect(normalizeConfig({ networkMode: 'weird' }).networkMode).toBe('hybrid')
    expect(normalizeConfig({ networkMode: 'internal' }).networkMode).toBe('internal')
  })

  it('null / undefined / 垃圾输入都得到完整合法配置', () => {
    for (const input of [null, undefined, 'string', 42, []]) {
      const cfg = normalizeConfig(input)
      expect(Object.keys(cfg).sort()).toEqual(Object.keys(DEFAULT_CONFIG).sort())
    }
  })
})
