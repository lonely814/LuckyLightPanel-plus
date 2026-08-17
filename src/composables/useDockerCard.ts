import { computed } from 'vue'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import type { DockerContainer } from '@/types'

/**
 * Docker 容器卡片共享逻辑
 * 各布局子组件复用，避免重复实现
 */
export function useDockerCard(container: DockerContainer) {
  const navStore = useNavStore()
  const configStore = useConfigStore()

  // 布局模式
  const layout = computed(() => configStore.dockerLayout)

  // 获取容器统计数据
  const stats = computed(() => {
    return navStore.getContainerStats(container.containerName)
  })

  // 容器状态
  const containerState = computed(() => {
    return stats.value?.state || container.state || 'unknown'
  })

  // 容器状态详情（包含运行时长）
  const containerStatus = computed(() => {
    return stats.value?.status || container.status || ''
  })

  // 解析状态时长信息
  const statusDuration = computed(() => {
    const status = containerStatus.value
    if (!status) return ''

    // 解析 "Up 2 hours"、"Up 3 days"、"Exited (0) 2 hours ago" 等格式
    const upMatch = status.match(/Up\s+(.+?)(?:\s+\(|$)/)
    const exitedMatch = status.match(/Exited.*?\)\s+(.+?)\s+ago/)

    if (upMatch) {
      return translateDuration(upMatch[1].trim())
    }
    if (exitedMatch) {
      return translateDuration(exitedMatch[1].trim()) + '前'
    }
    return ''
  })

  // 翻译时长为中文
  function translateDuration(durationStr: string): string {
    if (!durationStr) return ''

    // 特殊格式处理
    const lowerStr = durationStr.toLowerCase()
    if (lowerStr === 'about a minute') return '约1分钟'
    if (lowerStr === 'about an hour') return '约1小时'
    if (lowerStr === 'less than a second') return '不到一秒'

    // 翻译映射
    const translations: Record<string, string> = {
      'second': '秒',
      'seconds': '秒',
      'minute': '分钟',
      'minutes': '分钟',
      'hour': '小时',
      'hours': '小时',
      'day': '天',
      'days': '天',
      'week': '周',
      'weeks': '周',
      'month': '月',
      'months': '月'
    }

    // 匹配 "数字 + 单位" 格式
    const match = durationStr.match(/(\d+)\s+(\w+)/)
    if (match) {
      const num = match[1]
      const unit = match[2].toLowerCase()
      const translatedUnit = translations[unit] || unit
      return num + translatedUnit
    }

    return durationStr
  }

  // 状态配置 - 霓虹风格
  const stateConfig = computed(() => {
    switch (containerState.value) {
      case 'running':
        return {
          class: 'status-running',
          text: '运行中',
          shortText: 'RUN',
          color: 'hsl(var(--neon-green))',
          bgColor: 'hsl(var(--neon-green) / 0.1)',
          borderColor: 'hsl(var(--neon-green) / 0.3)',
          shadow: 'var(--neon-green)'
        }
      case 'exited':
      case 'dead':
        return {
          class: 'status-stopped',
          text: '已停止',
          shortText: 'STOP',
          color: 'hsl(var(--error))',
          bgColor: 'hsl(var(--error) / 0.1)',
          borderColor: 'hsl(var(--error) / 0.3)',
          shadow: 'var(--error)'
        }
      case 'paused':
      case 'restarting':
        return {
          class: 'status-paused',
          text: containerState.value === 'paused' ? '已暂停' : '重启中',
          shortText: containerState.value === 'paused' ? 'PAUSE' : 'RESTART',
          color: 'hsl(var(--warning))',
          bgColor: 'hsl(var(--warning) / 0.1)',
          borderColor: 'hsl(var(--warning) / 0.3)',
          shadow: 'var(--warning)'
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

  // 格式化网速
  function formatSpeed(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec} B/s`
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} K/s`
    return `${(bytesPerSec / 1024 / 1024).toFixed(1)} M/s`
  }

  // 格式化简短网速
  function formatSpeedShort(bytesPerSec: number): string {
    if (bytesPerSec < 1024) return `${bytesPerSec}B`
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(0)}K`
    return `${(bytesPerSec / 1024 / 1024).toFixed(1)}M`
  }

  // 显示名称
  const displayName = computed(() => {
    return container.displayName || container.containerName
  })

  // 图标 URL 处理（支持完整链接和本地路径）
  const iconUrl = computed(() => {
    if (!container.iconUrl) return null
    const url = container.iconUrl
    // 如果是完整链接（http:// 或 https://），直接使用
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    // 否则拼接本地 iconlibs 路径
    return `./backend/iconlibs/${url}`
  })

  // CPU 百分比数值
  const cpuValue = computed(() => {
    const cpu = stats.value?.cpuPercent || '0%'
    return parseFloat(cpu.replace('%', '')) || 0
  })

  // 历史趋势数据（走势图）
  const cpuHistory = computed(() => navStore.getContainerHistory(container.containerName)?.cpu || [])
  const memHistory = computed(() => navStore.getContainerHistory(container.containerName)?.memory || [])
  const rxHistory = computed(() => navStore.getContainerHistory(container.containerName)?.rx || [])
  const txHistory = computed(() => navStore.getContainerHistory(container.containerName)?.tx || [])

  // 是否运行中
  const isRunning = computed(() => containerState.value === 'running')

  // 机柜布局 LED 状态灯样式
  const rackLedStyle = computed(() => {
    const active = isRunning.value
    return {
      backgroundColor: active ? 'hsl(var(--neon-green))' : 'hsl(var(--text-muted))',
      boxShadow: active ? '0 0 6px hsl(var(--neon-green) / 0.9)' : 'none'
    }
  })

  // 机柜布局活动灯样式
  const rackActLedStyle = computed(() => {
    const active = isRunning.value
    return {
      backgroundColor: active ? 'hsl(var(--docker-orange))' : 'hsl(var(--text-muted))',
      boxShadow: active ? '0 0 6px hsl(var(--docker-orange) / 0.9)' : 'none'
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
        background: `linear-gradient(135deg, ${stateConfig.value.color}, hsl(var(--docker-orange)))`,
        boxShadow: `0 2px 10px -2px hsl(${stateConfig.value.shadow} / 0.4)`
      }
    }
  })

  // 图标背景样式（根据是否有自定义图标区分）
  const iconBgStyle = computed(() => {
    if (iconUrl.value) {
      // 有图标：使用主题适配的中性背景
      return {
        boxShadow: `0 4px 20px -4px hsl(var(--icon-placeholder-bg) / 0.5)`
      }
    } else {
      // 无图标：使用状态颜色渐变背景
      return {
        background: `linear-gradient(135deg, ${stateConfig.value.color}, hsl(var(--docker-orange)))`,
        boxShadow: `0 4px 20px -4px hsl(${stateConfig.value.shadow} / 0.5)`
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
        background: `linear-gradient(135deg, ${stateConfig.value.color}, hsl(var(--docker-orange)))`,
        boxShadow: `0 2px 12px -2px hsl(${stateConfig.value.shadow} / 0.4)`
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
        background: `linear-gradient(135deg, ${stateConfig.value.color}, hsl(var(--docker-orange)))`,
        boxShadow: `0 2px 10px -2px hsl(${stateConfig.value.shadow} / 0.4)`
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
        background: `linear-gradient(135deg, ${stateConfig.value.color}, hsl(var(--docker-orange)))`,
        boxShadow: `0 3px 15px -3px hsl(${stateConfig.value.shadow} / 0.5)`
      }
    }
  })

  // 可访问性标签
  const ariaLabel = computed(() => {
    const parts = [`Docker 容器: ${displayName.value}`]
    parts.push(`状态: ${stateConfig.value.text}`)
    if (container.description) {
      parts.push(container.description)
    }
    return parts.join(' - ')
  })

  return {
    layout,
    stats,
    containerState,
    containerStatus,
    statusDuration,
    stateConfig,
    displayName,
    iconUrl,
    cpuValue,
    cpuHistory,
    memHistory,
    rxHistory,
    txHistory,
    isRunning,
    rackLedStyle,
    rackActLedStyle,
    rackIconBgStyle,
    iconBgStyle,
    compactIconBgStyle,
    listIconBgStyle,
    minimalIconBgStyle,
    formatSpeed,
    formatSpeedShort,
    ariaLabel
  }
}