import { computed, ref } from 'vue'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import { Globe, Network, Wifi } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { LuckyService } from '@/types'

/**
 * Lucky 服务卡片共享逻辑
 * PDF 各布局子组件复用，避免重复实现
 */
export function useServiceCard(service: LuckyService) {
  const navStore = useNavStore()
  const configStore = useConfigStore()

  // 复制状态
  const copied = ref(false)

  // 复制到剪贴板
  async function copyToClipboard(text: string, event: MouseEvent) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // 布局模式
  const layout = computed(() => configStore.luckyServicesLayout)

  // 获取服务统计数据
  const stats = computed(() => {
    return navStore.getServiceStats(service.key)
  })

  // 服务状态
  const serviceState = computed(() => {
    return stats.value?.state || service.state || 'unknown'
  })

  // 状态配置 - 霓虹风格
  const stateConfig = computed(() => {
    switch (serviceState.value) {
      case 'running':
      case 'enabled':
        return {
          class: 'status-running',
          text: serviceState.value === 'running' ? '运行中' : '已启用',
          shortText: 'RUN',
          color: 'hsl(var(--neon-green))',
          bgColor: 'hsl(var(--neon-green) / 0.1)',
          borderColor: 'hsl(var(--neon-green) / 0.3)',
          shadow: 'var(--neon-green)'
        }
      case 'stopped':
      case 'disabled':
        return {
          class: 'status-stopped',
          text: serviceState.value === 'stopped' ? '已停止' : '已禁用',
          shortText: 'STOP',
          color: 'hsl(var(--text-muted))',
          bgColor: 'hsl(var(--text-muted) / 0.1)',
          borderColor: 'hsl(var(--text-muted) / 0.2)',
          shadow: 'var(--text-muted)'
        }
      case 'error':
        return {
          class: 'status-error',
          text: '错误',
          shortText: 'ERR',
          color: 'hsl(var(--error))',
          bgColor: 'hsl(var(--error) / 0.1)',
          borderColor: 'hsl(var(--error) / 0.3)',
          shadow: 'var(--error)'
        }
      default:
        return {
          class: 'status-unknown',
          text: '未知',
          shortText: '---',
          color: 'hsl(var(--text-muted))',
          bgColor: 'hsl(var(--text-muted) / 0.1)',
          borderColor: 'hsl(var(--text-muted) / 0.2)',
          shadow: 'var(--text-muted)'
        }
    }
  })

  // 服务类型配置
  const typeConfig = computed(() => {
    switch (service.serviceType) {
      case 'webservice':
      case 'webservice-main':
      case 'webservice-default':
        return {
          icon: Globe as Component,
          label: 'Web服务',
          shortLabel: 'WEB',
          color: 'var(--neon-cyan)',
          shadow: 'var(--neon-cyan)'
        }
      case 'portforward':
        return {
          icon: Network as Component,
          label: '端口转发',
          shortLabel: 'PF',
          color: 'var(--neon-purple)',
          shadow: 'var(--neon-purple)'
        }
      case 'stun':
        return {
          icon: Wifi as Component,
          label: 'STUN',
          shortLabel: 'STUN',
          color: 'var(--warning)',
          shadow: 'var(--warning)'
        }
      default:
        return {
          icon: Globe as Component,
          label: '服务',
          shortLabel: 'SVC',
          color: 'var(--neon-blue)',
          shadow: 'var(--neon-blue)'
        }
    }
  })

  // 显示名称
  const displayName = computed(() => {
    return service.displayName || service.name
  })

  // 图标 URL 处理（支持完整链接和本地路径）
  const iconUrl = computed(() => {
    if (!service.iconUrl) return null
    const url = service.iconUrl
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `./backend/iconlibs/${url}`
  })

  // 格式化流量
  function formatTraffic(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
  }

  // 格式化简短流量
  function formatTrafficShort(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}M`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)}G`
  }

  // 格式化速度
  function formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec} B/s`
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} K/s`
    return `${(bytesPerSec / 1024 / 1024).toFixed(1)} M/s`
  }

  // 是否显示网速（只有Web服务有网速）
  const showSpeed = computed(() => {
    return service.serviceType?.startsWith('webservice')
  })

  // 历史趋势数据（走势图）
  const inSpeedHistory = computed(() => navStore.getServiceHistory(service.key)?.inSpeed || [])
  const outSpeedHistory = computed(() => navStore.getServiceHistory(service.key)?.outSpeed || [])

  // 是否活跃
  const isActive = computed(() => {
    return serviceState.value === 'running' || serviceState.value === 'enabled'
  })

  // 机柜布局 LED 状态灯样式
  const rackLedStyle = computed(() => {
    const active = isActive.value
    return {
      backgroundColor: active ? 'hsl(var(--neon-green))' : 'hsl(var(--text-muted))',
      boxShadow: active ? '0 0 6px hsl(var(--neon-green) / 0.9)' : 'none'
    }
  })

  // 机柜布局活动灯样式
  const rackActLedStyle = computed(() => {
    const active = isActive.value
    return {
      backgroundColor: active ? `hsl(${typeConfig.value.color})` : 'hsl(var(--text-muted))',
      boxShadow: active ? `0 0 6px hsl(${typeConfig.value.shadow} / 0.9)` : 'none'
    }
  })

  // 机柜布局图标背景样式
  const rackIconBgStyle = computed(() => {
    if (iconUrl.value) {
      return {
        boxShadow: `0 2px 10px -2px hsl(var(--icon-placeholder-bg) / 0.4)`
      }
    } else {
      return {
        background: `linear-gradient(135deg, hsl(${typeConfig.value.color}), hsl(var(--neon-cyan)))`,
        boxShadow: `0 2px 10px -2px hsl(${typeConfig.value.shadow} / 0.4)`
      }
    }
  })

  // 图标背景样式（根据是否有自定义图标区分）
  const iconBgStyle = computed(() => {
    if (iconUrl.value) {
      return {
        boxShadow: `0 4px 20px -4px hsl(var(--icon-placeholder-bg) / 0.5)`
      }
    } else {
      return {
        background: `linear-gradient(135deg, hsl(${typeConfig.value.color}), hsl(var(--neon-cyan)))`,
        boxShadow: `0 4px 20px -4px hsl(${typeConfig.value.shadow} / 0.5)`
      }
    }
  })

  // 紧凑布局图标背景样式
  const compactIconBgStyle = computed(() => {
    if (iconUrl.value) {
      return {
        boxShadow: `0 2px 12px -2px hsl(var(--icon-placeholder-bg) / 0.4)`
      }
    } else {
      return {
        background: `linear-gradient(135deg, hsl(${typeConfig.value.color}), hsl(var(--neon-cyan)))`,
        boxShadow: `0 2px 12px -2px hsl(${typeConfig.value.shadow} / 0.4)`
      }
    }
  })

  // 列表布局图标背景样式
  const listIconBgStyle = computed(() => {
    if (iconUrl.value) {
      return {
        boxShadow: `0 2px 10px -2px hsl(var(--icon-placeholder-bg) / 0.4)`
      }
    } else {
      return {
        background: `linear-gradient(135deg, hsl(${typeConfig.value.color}), hsl(var(--neon-cyan)))`,
        boxShadow: `0 2px 10px -2px hsl(${typeConfig.value.shadow} / 0.4)`
      }
    }
  })

  // 极简布局图标背景样式
  const minimalIconBgStyle = computed(() => {
    if (iconUrl.value) {
      return {
        boxShadow: `0 3px 15px -3px hsl(var(--icon-placeholder-bg) / 0.5)`
      }
    } else {
      return {
        background: `linear-gradient(135deg, hsl(${typeConfig.value.color}), hsl(var(--neon-cyan)))`,
        boxShadow: `0 3px 15px -3px hsl(${typeConfig.value.shadow} / 0.5)`
      }
    }
  })

  // 可访问性标签
  const ariaLabel = computed(() => {
    const parts = [`Lucky 服务: ${displayName.value}`]
    parts.push(`类型: ${typeConfig.value.label}`)
    parts.push(`状态: ${stateConfig.value.text}`)
    if (service.description) {
      parts.push(service.description)
    }
    return parts.join(' - ')
  })

  return {
    copied,
    copyToClipboard,
    layout,
    stats,
    serviceState,
    stateConfig,
    typeConfig,
    displayName,
    iconUrl,
    formatTraffic,
    formatTrafficShort,
    formatSpeed,
    showSpeed,
    inSpeedHistory,
    outSpeedHistory,
    isActive,
    rackLedStyle,
    rackActLedStyle,
    rackIconBgStyle,
    iconBgStyle,
    compactIconBgStyle,
    listIconBgStyle,
    minimalIconBgStyle,
    ariaLabel
  }
}