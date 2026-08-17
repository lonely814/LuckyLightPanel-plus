import { describe, it, expect } from 'vitest'
import {
  getEffectiveNetworkType,
  getHybridUrls,
  getSingleTypeUrls,
  getBestUrl,
  toSiteLinks
} from './siteLinks'
import type { Site } from '@/types'

const site = (partial: Partial<Site> = {}): Site => ({
  key: 'test',
  name: '测试',
  ...partial
})

describe('getEffectiveNetworkType', () => {
  it('固定模式直接返回', () => {
    expect(getEffectiveNetworkType('internal', 'external', false)).toBe('internal')
    expect(getEffectiveNetworkType('external', 'internal', false)).toBe('external')
    expect(getEffectiveNetworkType('hybrid', 'internal', false)).toBe('hybrid')
  })

  it('auto 模式查询失败降级为 hybrid', () => {
    expect(getEffectiveNetworkType('auto', 'external', true)).toBe('hybrid')
  })

  it('auto 模式查询成功返回服务器类型', () => {
    expect(getEffectiveNetworkType('auto', 'internal', false)).toBe('internal')
    expect(getEffectiveNetworkType('auto', 'external', false)).toBe('external')
  })
})

describe('getHybridUrls', () => {
  it('混合模式返回内网在前、外网在后', () => {
    const result = getHybridUrls(site({
      backendUrls: ['http://lan-a', 'http://lan-b'],
      frontendUrls: ['http://wan-a']
    }))
    expect(result).toEqual([
      { url: 'http://lan-a', label: '内网链接 1', type: 'internal' },
      { url: 'http://lan-b', label: '内网链接 2', type: 'internal' },
      { url: 'http://wan-a', label: '外网链接', type: 'external' }
    ])
  })

  it('过滤空字符串链接', () => {
    const result = getHybridUrls(site({
      backendUrls: ['', 'http://lan', ' '],
      frontendUrls: ['']
    }))
    expect(result).toEqual([
      { url: 'http://lan', label: '内网链接', type: 'internal' }
    ])
  })

  it('无链接返回空数组', () => {
    expect(getHybridUrls(site())).toEqual([])
  })
})

describe('getSingleTypeUrls', () => {
  it('外网模式优先外网链接', () => {
    const result = getSingleTypeUrls(site({
      frontendUrls: ['http://wan'],
      backendUrls: ['http://lan']
    }), 'external')
    expect(result).toEqual([{ url: 'http://wan', label: '外网链接', type: 'external' }])
  })

  it('外网模式无外网但有多个内网链接时降级', () => {
    const result = getSingleTypeUrls(site({
      backendUrls: ['http://lan-a', 'http://lan-b']
    }), 'external')
    expect(result).toEqual([
      { url: 'http://lan-a', label: '内网链接 1', type: 'internal' },
      { url: 'http://lan-b', label: '内网链接 2', type: 'internal' }
    ])
  })

  it('外网模式只有单个内网链接时不降级（返回空）', () => {
    const result = getSingleTypeUrls(site({
      backendUrls: ['http://lan-only']
    }), 'external')
    expect(result).toEqual([])
  })

  it('内网模式优先内网链接', () => {
    const result = getSingleTypeUrls(site({
      frontendUrls: ['http://wan'],
      backendUrls: ['http://lan']
    }), 'internal')
    expect(result).toEqual([{ url: 'http://lan', label: '内网链接', type: 'internal' }])
  })

  it('内网模式无内网但有多个外网链接时降级', () => {
    const result = getSingleTypeUrls(site({
      frontendUrls: ['http://wan-a', 'http://wan-b']
    }), 'internal')
    expect(result).toEqual([
      { url: 'http://wan-a', label: '外网链接 1', type: 'external' },
      { url: 'http://wan-b', label: '外网链接 2', type: 'external' }
    ])
  })
})

describe('getBestUrl', () => {
  const dual = site({
    frontendUrls: ['http://wan'],
    backendUrls: ['http://lan']
  })

  it('internal/hybrid 模式优先内网', () => {
    expect(getBestUrl(dual, 'internal')).toBe('http://lan')
    expect(getBestUrl(dual, 'hybrid')).toBe('http://lan')
  })

  it('external 模式优先外网', () => {
    expect(getBestUrl(dual, 'external')).toBe('http://wan')
  })

  it('只有一种链接时跨类型回退', () => {
    const onlyLan = site({ backendUrls: ['http://lan'] })
    expect(getBestUrl(onlyLan, 'external')).toBe('http://lan')
  })

  it('无可用链接返回 null', () => {
    expect(getBestUrl(site(), 'internal')).toBeNull()
  })
})

describe('toSiteLinks', () => {
  it('展开并过滤站点链接字段', () => {
    const s = site({
      frontendUrls: ['http://wan', ''],
      backendUrls: ['', 'http://lan', ' ']
    })
    expect(toSiteLinks(s)).toEqual({
      frontendUrls: ['http://wan'],
      backendUrls: ['http://lan']
    })
  })

  it('无链接字段时输出空数组', () => {
    expect(toSiteLinks(site())).toEqual({ frontendUrls: [], backendUrls: [] })
  })
})