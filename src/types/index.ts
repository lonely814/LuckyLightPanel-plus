// ============ 后端契约（与 public/backend/*.json 一一对应） ============

/** nav.json */
export interface NavConfig {
  version?: string
  settings: NavSettings
  sitesEnabled?: boolean
  dockerEnabled?: boolean
  luckyServicesEnabled?: boolean
}

export interface NavSettings {
  title: string
  subtitle?: string
  logo?: string
  favicon?: string
  backgroundImages?: string[]
  custom?: Record<string, unknown>
}

/** 分组（sites / docker / luckyservices 共用结构） */
export interface Group {
  key: string
  name: string
  icon?: string
  order?: number
  count?: number
}

/** sites.json */
export interface SitesData {
  networkType: NetworkType
  clientIP: string
  groups: Group[]
  sites: Site[]
}

export interface Site {
  key: string
  name: string
  description?: string
  iconUrl?: string
  frontendUrls?: string[]
  backendUrls?: string[]
  groupKey?: string
  order?: number
  enable?: boolean
  target?: string
}

/** docker.json */
export interface DockerData {
  groups: Group[]
  containers: DockerContainer[]
}

export interface DockerContainer {
  key: string
  containerName: string
  containerId?: string
  displayName?: string
  description?: string
  iconUrl?: string
  state?: DockerState
  status?: string
  groupKey?: string
  order?: number
  enable?: boolean
  showStatus?: boolean
  composeProject?: string
}

export type DockerState = 'running' | 'exited' | 'paused' | 'restarting' | 'created' | 'unknown'

/** docker-stats.json（字段可能缺失，见 tests/contract） */
export interface DockerStatsResponse {
  ret: number
  stats: DockerStat[]
}

export interface DockerStat {
  key?: string
  containerName: string
  displayName?: string
  iconUrl?: string
  state: string
  status?: string
  cpuPercent?: string
  memoryUsage?: string
  memoryPercent?: string
  networkRx?: string
  networkTx?: string
  networkRxSpeed?: number
  networkTxSpeed?: number
  diskReadSpeed?: number
  diskWriteSpeed?: number
}

/** luckyservices.json */
export interface LuckyServicesData {
  groups: Group[]
  services: LuckyService[]
}

export interface LuckyService {
  key: string
  name: string
  displayName?: string
  description?: string
  iconUrl?: string
  serviceType: ServiceType
  state?: ServiceState
  groupKey?: string
  order?: number
  enable?: boolean
  showStatus?: boolean
  publicAddr?: string
}

export type ServiceType = 'webservice' | 'webservice-main' | 'webservice-default' | 'portforward' | 'stun'
export type ServiceState = 'running' | 'enabled' | 'stopped' | 'disabled' | 'error' | 'unknown'

/** luckyservices-stats.json */
export interface LuckyServicesStatsResponse {
  ret: number
  stats: LuckyServiceStat[]
}

export interface LuckyServiceStat {
  key: string
  state: string
  displayName?: string
  iconUrl?: string
  tcpCurrentConnections?: number
  udpCurrentConnections?: number
  trafficIn?: number
  trafficOut?: number
  inSpeed?: number
  outSpeed?: number
  publicAddr?: string
}

/** 网络类型 */
export type NetworkType = 'internal' | 'external'
export type NetworkMode = 'auto' | 'internal' | 'external' | 'hybrid'

export interface NetworkTypeResponse {
  networkType: NetworkType
  clientIP: string
}

// ============ 前端配置 ============

/** 主题：只保留浅色/深色 */
export type ThemeMode = 'light' | 'dark'
export const THEME_IDS: readonly ThemeMode[] = ['light', 'dark'] as const

/** 布局：只保留卡片/紧凑 */
export type LayoutMode = 'card' | 'compact'
export const LAYOUT_IDS: readonly LayoutMode[] = ['card', 'compact'] as const

export type TabType = 'sites' | 'docker' | 'luckyServices'
export const TAB_IDS: readonly TabType[] = ['sites', 'docker', 'luckyServices'] as const

/** 分组选择：'all' 或选中键数组（空数组等价 all） */
export type GroupSelection = 'all' | string[]
export type TabGroups = Record<TabType, GroupSelection>
export type TabSearchKeywords = Record<TabType, string>

export interface UserConfig {
  theme: ThemeMode
  background: string
  customBgUrl: string
  layout: LayoutMode
  dockerLayout: LayoutMode
  luckyServicesLayout: LayoutMode
  layoutScale: number
  siteCardSize: number
  showDescription: boolean
  showTime: boolean
  showHeader: boolean
  tabGroups: TabGroups
  networkMode: NetworkMode
  currentTab: TabType
  /** 以下为百分比，100 = 主题默认 */
  detailTextContrast: number
  detailRadiusScale: number
  detailGlassBlurScale: number
  detailGlassOpacityScale: number
  detailReduceMotion: boolean
  detailLiquid: boolean
}

export interface PresetBackground {
  id: string
  name: string
  type: 'gradient' | 'image'
  value: string
}

export interface LinkItem {
  url: string
  label: string
  type: 'internal' | 'external'
}
