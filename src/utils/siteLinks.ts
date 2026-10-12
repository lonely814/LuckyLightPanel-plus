/**
 * 站点链接选择逻辑 - 纯函数模块
 * 决策树：网络模式 × 站点内/外网链接 × 多链接降级
 */
import type { Site, LinkItem, NetworkMode, NetworkType } from '@/types'

/** 通过 props 传入的站点链接字段 */
interface SiteLinks {
  frontendUrls?: string[]
  backendUrls?: string[]
}

function validUrls(urls?: string[]): string[] {
  return (urls || []).filter(u => u && u.trim())
}

/**
 * 计算有效网络类型（根据网络模式）
 * auto 模式：查询失败时降级为混合模式
 */
export function getEffectiveNetworkType(
  networkMode: NetworkMode,
  networkType: NetworkType,
  networkTypeFetchFailed: boolean
): 'internal' | 'external' | 'hybrid' {
  if (networkMode === 'internal') return 'internal'
  if (networkMode === 'external') return 'external'
  if (networkMode === 'hybrid') return 'hybrid'
  // auto 模式：查询失败时降级为混合模式
  if (networkMode === 'auto' && networkTypeFetchFailed) return 'hybrid'
  return networkType
}

/** 获取混合模式下的所有可用链接 */
export function getHybridUrls(site: SiteLinks): LinkItem[] {
  const urls: LinkItem[] = []
  const validBackend = validUrls(site.backendUrls)
  const validFrontend = validUrls(site.frontendUrls)

  validBackend.forEach((url, index) => {
    urls.push({
      url,
      label: validBackend.length > 1 ? `内网链接 ${index + 1}` : '内网链接',
      type: 'internal'
    })
  })

  validFrontend.forEach((url, index) => {
    urls.push({
      url,
      label: validFrontend.length > 1 ? `外网链接 ${index + 1}` : '外网链接',
      type: 'external'
    })
  })

  return urls
}

/** 获取单一网络类型的链接列表 */
export function getSingleTypeUrls(site: SiteLinks, type: 'internal' | 'external'): LinkItem[] {
  const validFrontend = validUrls(site.frontendUrls)
  const validBackend = validUrls(site.backendUrls)

  if (type === 'external') {
    // 外网模式：优先检查外网链接
    if (validFrontend.length > 0) {
      return validFrontend.map((url, index) => ({
        url,
        label: validFrontend.length > 1 ? `外网链接 ${index + 1}` : '外网链接',
        type: 'external' as const
      }))
    }
    // 没有外网链接但有多个内网链接
    if (validBackend.length > 1) {
      return validBackend.map((url, index) => ({
        url,
        label: `内网链接 ${index + 1}`,
        type: 'internal' as const
      }))
    }
  } else {
    // 内网模式：优先检查内网链接
    if (validBackend.length > 0) {
      return validBackend.map((url, index) => ({
        url,
        label: validBackend.length > 1 ? `内网链接 ${index + 1}` : '内网链接',
        type: 'internal' as const
      }))
    }
    // 没有内网链接但有多个外网链接
    if (validFrontend.length > 1) {
      return validFrontend.map((url, index) => ({
        url,
        label: `外网链接 ${index + 1}`,
        type: 'external' as const
      }))
    }
  }

  return []
}

/** 获取最佳单一链接（用于直接打开） */
export function getBestUrl(site: SiteLinks, effectiveType: 'internal' | 'external' | 'hybrid'): string | null {
  const validFrontend = validUrls(site.frontendUrls)
  const validBackend = validUrls(site.backendUrls)

  const getValidUrl = (urls: string[]) => urls.find(u => u && u.trim())

  if (effectiveType === 'internal' || effectiveType === 'hybrid') {
    // 内网/混合模式优先内网
    return getValidUrl(validBackend) || getValidUrl(validFrontend) || null
  }
  // 外网模式优先外网
  return getValidUrl(validFrontend) || getValidUrl(validBackend) || null
}

/** 完整的内部/链接类型字段（供测试与调用方推导） */
export interface ResolvedSiteLinks {
  frontendUrls: string[]
  backendUrls: string[]
}

/** 展开站点为链接字段（便于纯函数调用） */
export function toSiteLinks(site: Site): ResolvedSiteLinks {
  return {
    frontendUrls: validUrls(site.frontendUrls),
    backendUrls: validUrls(site.backendUrls)
  }
}

/**
 * 解析站点图标显示地址。
 * 优先级：手动配置(iconUrl) > 兜底推导(站点 origin + /favicon.ico)
 * iconUrl 支持三种形式：完整 http(s) 地址、Lucky 图标库相对路径、空。
 * ponytail: 兜底只猜 /favicon.ico（自建服务命中率低），失败由 <img onerror> 回落首字母，不引入请求成本
 */
export function resolveSiteIcon(
  iconUrl: string | undefined,
  site: SiteLinks,
  effectiveType: 'internal' | 'external' | 'hybrid',
  iconlibBase = './backend/iconlibs/'
): string | null {
  const raw = (iconUrl || '').trim()
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw
    return iconlibBase + raw
  }

  // 未配置：用当前生效链接的 origin 推导 favicon
  const best = getBestUrl(site, effectiveType)
  if (!best) return null
  try {
    return new URL('/favicon.ico', best).origin + '/favicon.ico'
  } catch {
    return null
  }
}