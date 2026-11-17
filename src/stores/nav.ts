import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useConfigStore } from './config'
import type {
  DockerContainer,
  DockerData,
  DockerStat,
  DockerStatsResponse,
  Group,
  LuckyService,
  LuckyServiceStat,
  LuckyServicesData,
  LuckyServicesStatsResponse,
  NavConfig,
  NetworkType,
  Site,
  SitesData
} from '@/types'

const API = {
  nav: './backend/nav.json',
  sites: './backend/sites.json',
  docker: './backend/docker.json',
  dockerStats: './backend/docker-stats.json',
  luckyServices: './backend/luckyservices.json',
  luckyServicesStats: './backend/luckyservices-stats.json',
  networkType: './backend/api/network-type',
  config: './backend/default-config.json'
} as const

const POLL_INTERVAL = 5000
const HISTORY_LIMIT = 60
const HISTORY_KEYS = ['cpu', 'memory', 'rx', 'tx'] as const

export interface DockerHistory {
  cpu: number[]
  memory: number[]
  rx: number[]
  tx: number[]
}

export interface LuckyHistory {
  inSpeed: number[]
  outSpeed: number[]
}

/** 追加一个样本，超过上限丢弃最旧的 */
export function pushSample(series: number[], value: number, limit = HISTORY_LIMIT): number[] {
  const next = series.length >= limit ? series.slice(series.length - limit + 1) : series.slice()
  next.push(value)
  return next
}

function byOrder<T extends { order?: number; enable?: boolean }>(items: T[]): T[] {
  return items.filter(item => item.enable !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export const useNavStore = defineStore('nav', () => {
  const isLoading = ref(true)

  const navConfig = ref<NavConfig | null>(null)
  const sitesData = ref<SitesData | null>(null)
  const dockerData = ref<DockerData | null>(null)
  const luckyServicesData = ref<LuckyServicesData | null>(null)

  const networkType = ref<NetworkType>('external')
  const networkTypeFetchFailed = ref(false)
  const clientIP = ref('')

  const dockerStats = ref(new Map<string, DockerStat>())
  const luckyServicesStats = ref(new Map<string, LuckyServiceStat>())
  const dockerHistory = ref(new Map<string, DockerHistory>())
  const luckyServicesHistory = ref(new Map<string, LuckyHistory>())

  const siteGroups = computed<Group[]>(() => sitesData.value?.groups ?? [])
  const dockerGroups = computed<Group[]>(() => dockerData.value?.groups ?? [])
  const luckyServicesGroups = computed<Group[]>(() => luckyServicesData.value?.groups ?? [])

  const allSites = computed<Site[]>(() => byOrder(sitesData.value?.sites ?? []))
  const allContainers = computed<DockerContainer[]>(() => byOrder(dockerData.value?.containers ?? []))
  const allLuckyServices = computed<LuckyService[]>(() => byOrder(luckyServicesData.value?.services ?? []))

  const sitesEnabled = computed(() => navConfig.value?.sitesEnabled !== false)
  const dockerEnabled = computed(() => navConfig.value?.dockerEnabled === true)
  const luckyServicesEnabled = computed(() => navConfig.value?.luckyServicesEnabled === true)

  const panelTitle = computed(() => navConfig.value?.settings?.title || '轻面板')
  const panelSubtitle = computed(() => navConfig.value?.settings?.subtitle || '')
  const panelFavicon = computed(() => navConfig.value?.settings?.favicon || '')
  const panelLogo = computed(() => navConfig.value?.settings?.logo || '')

  async function loadNavConfig() {
    const data = await fetchJson<NavConfig>(API.nav)
    if (!data) return null
    navConfig.value = data
    useConfigStore().setServerBackgrounds(data.settings?.backgroundImages ?? [])
    return data
  }

  async function loadSitesData() {
    const data = await fetchJson<SitesData>(API.sites)
    if (!data) return null
    sitesData.value = data
    networkType.value = data.networkType || 'external'
    clientIP.value = data.clientIP || ''
    return data
  }

  async function loadDockerData() {
    const data = await fetchJson<DockerData>(API.docker)
    if (!data) return null
    dockerData.value = data
    dockerHistory.value = new Map()
    return data
  }

  async function loadLuckyServicesData() {
    const data = await fetchJson<LuckyServicesData>(API.luckyServices)
    if (!data) return null
    luckyServicesData.value = data
    luckyServicesHistory.value = new Map()
    return data
  }

  async function fetchNetworkType() {
    const data = await fetchJson<{ networkType?: NetworkType; clientIP?: string }>(API.networkType)
    if (data?.networkType) {
      networkType.value = data.networkType
      clientIP.value = data.clientIP || ''
      networkTypeFetchFailed.value = false
      return
    }
    // 查询失败：auto 模式下降级为 hybrid（见 utils/siteLinks.ts）
    networkTypeFetchFailed.value = true
  }

  /** 服务器默认配置；接口不存在时静默降级（老版本后端没有此接口） */
  async function fetchServerConfig(): Promise<Record<string, unknown> | null> {
    const data = await fetchJson<{ ret?: number; config?: Record<string, unknown> }>(API.config)
    if (!data || data.ret !== 0 || !data.config) return null
    if (Object.keys(data.config).length === 0) return null
    return data.config
  }

  // ---- 统计轮询：上一轮未完成则跳过，避免慢接口堆积 ----
  let dockerInFlight = false
  let luckyInFlight = false
  let dockerTimer: ReturnType<typeof setInterval> | null = null
  let luckyTimer: ReturnType<typeof setInterval> | null = null

  function recordDockerHistory(stat: DockerStat) {
    const key = stat.containerName
    const prev = dockerHistory.value.get(key) ?? { cpu: [], memory: [], rx: [], tx: [] }
    dockerHistory.value.set(key, {
      cpu: pushSample(prev.cpu, Number.parseFloat(stat.cpuPercent ?? '') || 0),
      memory: pushSample(prev.memory, Number.parseFloat(stat.memoryPercent ?? '') || 0),
      rx: pushSample(prev.rx, stat.networkRxSpeed ?? 0),
      tx: pushSample(prev.tx, stat.networkTxSpeed ?? 0)
    })
  }

  async function loadDockerStats() {
    if (dockerInFlight) return
    dockerInFlight = true
    try {
      const data = await fetchJson<DockerStatsResponse>(API.dockerStats)
      if (data?.ret !== 0 || !data.stats) return
      const next = new Map<string, DockerStat>()
      for (const stat of data.stats) {
        next.set(stat.containerName, stat)
        recordDockerHistory(stat)
      }
      dockerStats.value = next
    } finally {
      dockerInFlight = false
    }
  }

  async function loadLuckyServicesStats() {
    if (luckyInFlight) return
    luckyInFlight = true
    try {
      const data = await fetchJson<LuckyServicesStatsResponse>(API.luckyServicesStats)
      if (data?.ret !== 0 || !data.stats) return
      const next = new Map<string, LuckyServiceStat>()
      for (const stat of data.stats) {
        next.set(stat.key, stat)
        const prev = luckyServicesHistory.value.get(stat.key) ?? { inSpeed: [], outSpeed: [] }
        luckyServicesHistory.value.set(stat.key, {
          inSpeed: pushSample(prev.inSpeed, stat.inSpeed ?? 0),
          outSpeed: pushSample(prev.outSpeed, stat.outSpeed ?? 0)
        })
      }
      luckyServicesStats.value = next
    } finally {
      luckyInFlight = false
    }
  }

  function stopDockerStatsPolling() {
    if (dockerTimer) {
      clearInterval(dockerTimer)
      dockerTimer = null
    }
  }

  function startDockerStatsPolling() {
    stopDockerStatsPolling()
    void loadDockerStats()
    dockerTimer = setInterval(() => void loadDockerStats(), POLL_INTERVAL)
  }

  function stopLuckyServicesStatsPolling() {
    if (luckyTimer) {
      clearInterval(luckyTimer)
      luckyTimer = null
    }
  }

  function startLuckyServicesStatsPolling() {
    stopLuckyServicesStatsPolling()
    void loadLuckyServicesStats()
    luckyTimer = setInterval(() => void loadLuckyServicesStats(), POLL_INTERVAL)
  }

  const getContainerStats = (name: string) => dockerStats.value.get(name)
  const getServiceStats = (key: string) => luckyServicesStats.value.get(key)
  const getContainerHistory = (name: string) => dockerHistory.value.get(name)
  const getServiceHistory = (key: string) => luckyServicesHistory.value.get(key)

  return {
    // state
    isLoading,
    navConfig,
    sitesData,
    dockerData,
    luckyServicesData,
    networkType,
    networkTypeFetchFailed,
    clientIP,
    dockerStats,
    luckyServicesStats,
    dockerHistory,
    luckyServicesHistory,
    // computed
    siteGroups,
    dockerGroups,
    luckyServicesGroups,
    allSites,
    allContainers,
    allLuckyServices,
    sitesEnabled,
    dockerEnabled,
    luckyServicesEnabled,
    panelTitle,
    panelSubtitle,
    panelLogo,
    panelFavicon,
    // actions
    loadNavConfig,
    loadSitesData,
    loadDockerData,
    loadLuckyServicesData,
    fetchNetworkType,
    fetchServerConfig,
    loadDockerStats,
    loadLuckyServicesStats,
    startDockerStatsPolling,
    stopDockerStatsPolling,
    startLuckyServicesStatsPolling,
    stopLuckyServicesStatsPolling,
    getContainerStats,
    getServiceStats,
    getContainerHistory,
    getServiceHistory
  }
})

export { HISTORY_KEYS, HISTORY_LIMIT, POLL_INTERVAL }
