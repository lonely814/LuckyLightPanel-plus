import { defineStore } from 'pinia'
import { computed, ref, type CSSProperties } from 'vue'
import type {
  GroupSelection,
  LayoutMode,
  NetworkMode,
  PresetBackground,
  TabGroups,
  TabSearchKeywords,
  TabType,
  ThemeMode,
  UserConfig
} from '@/types'
import { LAYOUT_IDS, TAB_IDS, THEME_IDS } from '@/types'

export const STORAGE_KEY = 'lightpanel_config'

export const PRESET_BACKGROUNDS: PresetBackground[] = [
  { id: 'ocean', name: '深海', type: 'gradient', value: 'linear-gradient(135deg, hsl(200 80% 25%) 0%, hsl(220 70% 40%) 100%)' },
  { id: 'slate', name: '石板', type: 'gradient', value: 'linear-gradient(135deg, hsl(220 30% 12%) 0%, hsl(220 22% 22%) 100%)' },
  { id: 'aurora', name: '极光', type: 'gradient', value: 'linear-gradient(135deg, hsl(250 60% 40%) 0%, hsl(320 60% 40%) 100%)' },
  { id: 'sunset', name: '日落', type: 'gradient', value: 'linear-gradient(135deg, hsl(320 80% 40%) 0%, hsl(260 70% 50%) 52%, hsl(200 80% 50%) 100%)' },
  { id: 'emerald', name: '翡翠', type: 'gradient', value: 'linear-gradient(135deg, hsl(160 70% 25%) 0%, hsl(150 80% 40%) 100%)' },
  { id: 'plain', name: '纯色', type: 'gradient', value: 'linear-gradient(135deg, hsl(220 20% 96%) 0%, hsl(220 25% 90%) 100%)' }
]

const DEFAULT_TAB_GROUPS: TabGroups = { sites: 'all', docker: 'all', luckyServices: 'all' }
const DEFAULT_SEARCH_KEYWORDS: TabSearchKeywords = { sites: '', docker: '', luckyServices: '' }

export const DEFAULT_CONFIG: UserConfig = {
  theme: 'dark',
  background: 'ocean',
  customBgUrl: '',
  layout: 'card',
  dockerLayout: 'card',
  luckyServicesLayout: 'card',
  layoutScale: 1,
  siteCardSize: 100,
  showDescription: true,
  showTime: true,
  showHeader: true,
  tabGroups: { ...DEFAULT_TAB_GROUPS },
  networkMode: 'hybrid',
  currentTab: 'sites',
  detailTextContrast: 100,
  detailRadiusScale: 100,
  detailGlassBlurScale: 100,
  detailGlassOpacityScale: 100,
  detailReduceMotion: false,
  detailLiquid: false
}

/** 旧 9 套主题 → light / dark（只保留明暗两档） */
const LEGACY_THEME: Record<string, ThemeMode> = {
  light: 'light',
  dark: 'dark',
  blueprint: 'dark',
  bauhaus: 'dark',
  'crt-terminal': 'dark',
  'light-panel': 'light',
  console: 'dark',
  receipt: 'light',
  'arctic-aurora': 'dark',
  default: 'dark'
}

/** 旧 7 种布局 → card / compact */
const LEGACY_LAYOUT: Record<string, LayoutMode> = {
  card: 'card',
  normal: 'card',
  large: 'card',
  compact: 'compact',
  list: 'compact',
  minimal: 'compact',
  rack: 'compact',
  map: 'compact'
}

const CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as (keyof UserConfig)[]

function pickTheme(raw: unknown): ThemeMode {
  const key = String(raw ?? '')
  return LEGACY_THEME[key] ?? (THEME_IDS.includes(key as ThemeMode) ? (key as ThemeMode) : 'dark')
}

function pickLayout(raw: unknown, fallback: LayoutMode): LayoutMode {
  const key = String(raw ?? '')
  return LEGACY_LAYOUT[key] ?? (LAYOUT_IDS.includes(key as LayoutMode) ? (key as LayoutMode) : fallback)
}

function pickTab(raw: unknown): TabType {
  return TAB_IDS.includes(raw as TabType) ? (raw as TabType) : 'sites'
}

/** 旧版 tabGroups 可能缺键或存成数组/字符串混杂，统一成新结构 */
function pickTabGroups(raw: unknown): TabGroups {
  const source = (raw ?? {}) as Record<string, unknown>
  const pick = (value: unknown): GroupSelection => {
    if (value === 'all' || value === undefined || value === null) return 'all'
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string')
    return typeof value === 'string' ? [value] : 'all'
  }
  return { sites: pick(source.sites), docker: pick(source.docker), luckyServices: pick(source.luckyServices) }
}

function num(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number.parseFloat(String(raw ?? ''))
  return Number.isFinite(n) ? n : fallback
}

function bool(raw: unknown, fallback: boolean): boolean {
  return typeof raw === 'boolean' ? raw : fallback
}

function str(raw: unknown, fallback: string): string {
  return typeof raw === 'string' ? raw : fallback
}

/** 把任意来源（旧 localStorage / 后端 default-config）规整为合法 UserConfig */
export function normalizeConfig(input: unknown): UserConfig {
  const raw = (input ?? {}) as Record<string, unknown>
  const d = DEFAULT_CONFIG
  return {
    theme: pickTheme(raw.theme ?? d.theme),
    background: str(raw.background, d.background),
    customBgUrl: str(raw.customBgUrl, d.customBgUrl),
    layout: pickLayout(raw.layout, d.layout),
    dockerLayout: pickLayout(raw.dockerLayout, d.dockerLayout),
    luckyServicesLayout: pickLayout(raw.luckyServicesLayout, d.luckyServicesLayout),
    layoutScale: num(raw.layoutScale, d.layoutScale),
    siteCardSize: num(raw.siteCardSize, d.siteCardSize),
    showDescription: bool(raw.showDescription, d.showDescription),
    showTime: bool(raw.showTime, d.showTime),
    showHeader: bool(raw.showHeader, d.showHeader),
    tabGroups: pickTabGroups(raw.tabGroups ?? d.tabGroups),
    networkMode: (['auto', 'internal', 'external', 'hybrid'] as NetworkMode[]).includes(raw.networkMode as NetworkMode)
      ? (raw.networkMode as NetworkMode)
      : d.networkMode,
    currentTab: pickTab(raw.currentTab ?? d.currentTab),
    detailTextContrast: num(raw.detailTextContrast, d.detailTextContrast),
    detailRadiusScale: num(raw.detailRadiusScale, d.detailRadiusScale),
    detailGlassBlurScale: num(raw.detailGlassBlurScale, d.detailGlassBlurScale),
    detailGlassOpacityScale: num(raw.detailGlassOpacityScale, d.detailGlassOpacityScale),
    detailReduceMotion: bool(raw.detailReduceMotion, d.detailReduceMotion),
    detailLiquid: bool(raw.detailLiquid, d.detailLiquid)
  }
}

export const useConfigStore = defineStore('config', () => {
  const config = ref<UserConfig>({ ...DEFAULT_CONFIG })
  const settingsPanelOpen = ref(false)
  const searchKeywords = ref<TabSearchKeywords>({ ...DEFAULT_SEARCH_KEYWORDS })
  const serverBackgrounds = ref<PresetBackground[]>([])
  /** 本地是否已有配置：有则忽略服务器默认配置 */
  const hasStoredConfig = ref(false)

  const theme = computed(() => config.value.theme)
  const layout = computed(() => config.value.layout)
  const dockerLayout = computed(() => config.value.dockerLayout)
  const luckyServicesLayout = computed(() => config.value.luckyServicesLayout)
  const currentTab = computed(() => config.value.currentTab)
  const networkMode = computed(() => config.value.networkMode)
  const showHeader = computed(() => config.value.showHeader)
  const showTime = computed(() => config.value.showTime)
  const showDescription = computed(() => config.value.showDescription)

  const currentGroup = computed<GroupSelection>(() => config.value.tabGroups[config.value.currentTab] ?? 'all')
  const currentGroupArray = computed<string[]>(() =>
    currentGroup.value === 'all' ? [] : Array.isArray(currentGroup.value) ? currentGroup.value : [currentGroup.value]
  )
  const isAllSelected = computed(() => currentGroupArray.value.length === 0)
  const currentSearchKeyword = computed(() => searchKeywords.value[config.value.currentTab] ?? '')

  const allBackgrounds = computed(() => [...PRESET_BACKGROUNDS, ...serverBackgrounds.value])

  /** 背景样式：custom → 服务器图 → 预设渐变 → 首张预设 */
  const backgroundStyle = computed<CSSProperties>(() => {
    const id = config.value.background
    if (id === 'custom' && config.value.customBgUrl) {
      return { backgroundImage: `url(${config.value.customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    const server = serverBackgrounds.value.find(bg => bg.id === id)
    if (server) {
      return { backgroundImage: `url(${server.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    }
    const preset = PRESET_BACKGROUNDS.find(bg => bg.id === id)
    return { background: preset?.value ?? PRESET_BACKGROUNDS[0].value }
  })

  function saveConfig() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
    } catch (e) {
      console.warn('保存配置失败', e)
    }
  }

  function loadConfig() {
    let stored: Record<string, unknown> | null = null
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) stored = JSON.parse(raw) as Record<string, unknown>
    } catch (e) {
      console.warn('读取配置失败，使用默认值', e)
    }
    hasStoredConfig.value = stored !== null
    config.value = normalizeConfig(stored ?? DEFAULT_CONFIG)
    // 旧结构迁移后立刻回写，避免每次启动重复迁移
    if (stored) saveConfig()
  }

  /** 服务器下发的默认配置：仅当本地尚未保存过配置时生效 */
  function applyServerConfig(raw: unknown) {
    if (hasStoredConfig.value) return
    if (!raw || typeof raw !== 'object' || Object.keys(raw as object).length === 0) return
    const merged: Record<string, unknown> = { ...config.value }
    for (const key of CONFIG_KEYS) {
      const value = (raw as Record<string, unknown>)[key]
      if (value !== undefined) merged[key] = value
    }
    // 服务器背景已存在时，不允许默认配置把背景改回预设渐变
    if (serverBackgrounds.value.length > 0) merged.background = config.value.background
    config.value = normalizeConfig(merged)
    saveConfig()
  }

  function setServerBackgrounds(urls: string[]) {
    const valid = urls.filter(url => url && url.trim() !== '')
    serverBackgrounds.value = valid.map((url, index) => ({
      id: `server_${index}`,
      name: `服务器背景 ${index + 1}`,
      type: 'image' as const,
      value: url
    }))
    if (!hasStoredConfig.value && valid.length > 0) {
      config.value.background = 'server_0'
      saveConfig()
      return
    }
    validateCurrentBackground()
  }

  function validateCurrentBackground() {
    const id = config.value.background
    if (id === 'custom') return
    if (PRESET_BACKGROUNDS.some(bg => bg.id === id)) return
    if (serverBackgrounds.value.some(bg => bg.id === id)) return
    config.value.background = DEFAULT_CONFIG.background
    saveConfig()
  }

  function updateConfig<K extends keyof UserConfig>(key: K, value: UserConfig[K]) {
    config.value[key] = value
    saveConfig()
  }

  const setTheme = (value: ThemeMode) => updateConfig('theme', value)
  const setLayout = (value: LayoutMode) => updateConfig('layout', value)
  const setDockerLayout = (value: LayoutMode) => updateConfig('dockerLayout', value)
  const setLuckyServicesLayout = (value: LayoutMode) => updateConfig('luckyServicesLayout', value)

  function setCurrentTab(tab: TabType) {
    if (config.value.currentTab !== tab) updateConfig('currentTab', tab)
  }

  function setCurrentGroup(selection: GroupSelection) {
    updateConfig('tabGroups', { ...config.value.tabGroups, [config.value.currentTab]: selection })
  }

  /** 多选切换：点「全部」清空，点已选项移除，点未选项追加 */
  function toggleGroup(groupKey: string) {
    if (groupKey === 'all') {
      setCurrentGroup('all')
      return
    }
    const selected = currentGroupArray.value
    const next = selected.includes(groupKey) ? selected.filter(k => k !== groupKey) : [...selected, groupKey]
    setCurrentGroup(next.length === 0 ? 'all' : next)
  }

  function isGroupSelected(groupKey: string) {
    if (groupKey === 'all') return isAllSelected.value
    return currentGroupArray.value.includes(groupKey)
  }

  const setSearchKeyword = (keyword: string) => {
    searchKeywords.value[config.value.currentTab] = keyword
  }

  function setBackground(id: string, customUrl?: string) {
    updateConfig('background', id)
    if (customUrl !== undefined) updateConfig('customBgUrl', customUrl)
  }

  function toggleSettingsPanel(open?: boolean) {
    settingsPanelOpen.value = open ?? !settingsPanelOpen.value
  }

  function resetConfig() {
    config.value = { ...DEFAULT_CONFIG, tabGroups: { ...DEFAULT_TAB_GROUPS } }
    saveConfig()
  }

  return {
    config,
    settingsPanelOpen,
    searchKeywords,
    serverBackgrounds,
    hasStoredConfig,

    theme,
    layout,
    dockerLayout,
    luckyServicesLayout,
    currentTab,
    networkMode,
    showHeader,
    showTime,
    showDescription,
    currentGroup,
    currentGroupArray,
    isAllSelected,
    currentSearchKeyword,
    allBackgrounds,
    backgroundStyle,

    loadConfig,
    saveConfig,
    updateConfig,
    applyServerConfig,
    setServerBackgrounds,
    validateCurrentBackground,
    setTheme,
    setLayout,
    setDockerLayout,
    setLuckyServicesLayout,
    setCurrentTab,
    setCurrentGroup,
    toggleGroup,
    isGroupSelected,
    setSearchKeyword,
    setBackground,
    toggleSettingsPanel,
    resetConfig
  }
})
