import type { TabType } from '@/types'

/** 字节速率：B/s、K/s、M/s */
export function formatSpeed(bytesPerSec: number): string {
  if (!Number.isFinite(bytesPerSec) || bytesPerSec <= 0) return '0 B/s'
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} K/s`
  return `${(bytesPerSec / 1024 / 1024).toFixed(1)} M/s`
}

/** 累计流量：B、KB、MB、GB、TB */
export function formatTraffic(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${unit === 0 ? Math.round(value) : value.toFixed(2)} ${units[unit]}`
}

/** 内存用量字符串去掉空格："1.2GiB / 8GiB" → "1.2GiB/8GiB" */
export function compactMemory(raw: string | undefined): string {
  return raw ? raw.replace(/\s+/g, '') : '-'
}

/** 从 "12.34%" 之类的字符串取数值，失败返回 0 */
export function percentValue(raw: string | undefined): number {
  if (!raw) return 0
  const n = Number.parseFloat(raw.replace('%', ''))
  return Number.isFinite(n) ? n : 0
}

const DURATION_UNITS: Record<string, string> = {
  second: '秒',
  seconds: '秒',
  minute: '分钟',
  minutes: '分钟',
  hour: '小时',
  hours: '小时',
  day: '天',
  days: '天',
  week: '周',
  weeks: '周',
  month: '月',
  months: '月',
  year: '年',
  years: '年'
}

const DURATION_SPECIAL: Record<string, string> = {
  'less than a second': '不到一秒',
  'about a minute': '约1分钟',
  'about an hour': '约1小时',
  'about an hour ago': '约1小时前'
}

/** "2 hours" → "2小时" */
export function translateDuration(raw: string): string {
  const text = raw.trim().toLowerCase()
  if (!text) return ''
  const special = DURATION_SPECIAL[text]
  if (special) return special
  const match = text.match(/(\d+)\s+(\w+)/)
  if (!match) return raw.trim()
  return match[1] + (DURATION_UNITS[match[2]] ?? match[2])
}

/**
 * Docker status 文本 → 中文时长。
 * "Up 2 hours" → "已运行 2小时"；"Exited (0) 3 days ago" → "3天前"。
 */
export function dockerStatusDuration(status: string | undefined): string {
  if (!status) return ''
  const up = status.match(/Up\s+(.+?)(?:\s+\(|$)/)
  if (up) return `已运行 ${translateDuration(up[1])}`
  const exited = status.match(/Exited.*?\)\s+(.+?)\s+ago/)
  if (exited) return `${translateDuration(exited[1])}前`
  return ''
}

/** "1.2GiB / 4GiB" 之类 → 字节数，用于排序 */
export function memoryToBytes(raw: string | undefined): number {
  if (!raw) return 0
  const match = raw.match(/([\d.]+)\s*([KMGT]?)(i?B)?/i)
  if (!match) return 0
  const value = Number.parseFloat(match[1])
  if (!Number.isFinite(value)) return 0
  const scale: Record<string, number> = { '': 1, K: 1024, M: 1024 ** 2, G: 1024 ** 3, T: 1024 ** 4 }
  return value * (scale[match[2].toUpperCase()] ?? 1)
}

/** 秒数 → 本地时间 HH:mm:ss */
export function formatClock(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

/** 各标签页中文名（tab 与提示共用一份） */
export const TAB_LABELS: Record<TabType, string> = {
  sites: '站点',
  docker: 'Docker',
  luckyServices: 'Lucky'
}
