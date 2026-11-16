// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SiteGrid from './SiteGrid.vue'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import type { Site } from '@/types'

// 站点图标在测试里不加载网络
vi.mock('@/utils/siteLinks', async orig => {
  const mod = await orig<typeof import('@/utils/siteLinks')>()
  return { ...mod, resolveSiteIcon: () => '' }
})

function site(key: string, name: string, groupKey: string): Site {
  return {
    key,
    name,
    description: `${name} desc`,
    groupKey,
    frontendUrls: [`https://${key}.example.com`],
    backendUrls: [],
    enable: true,
    order: 1
  }
}

const SITES: Site[] = [
  site('a', 'Alpha', 'dev'),
  site('b', 'Bravo', 'dev'),
  site('c', 'Charlie', 'media')
]

function seed() {
  const nav = useNavStore()
  const config = useConfigStore()
  nav.sitesData = {
    networkType: 'external',
    clientIP: '127.0.0.1',
    groups: [
      { key: 'dev', name: '开发' },
      { key: 'media', name: '影音' }
    ],
    sites: SITES
  }
  nav.networkType = 'external'
  nav.networkTypeFetchFailed = false
  config.config.currentTab = 'sites'
  config.config.tabGroups = { sites: 'all', docker: 'all', luckyServices: 'all' }
  config.searchKeywords.sites = ''
  return { nav, config }
}

const stubs = {
  SearchBox: true,
  GroupDropdown: true,
  NetworkModeDropdown: true,
  LayoutSwitcher: true,
  SiteCard: { template: '<div class="site-card-stub" />' }
}

function mountGrid() {
  // 复用 seed() 建立的 active pinia，而非新建一份
  return mount(SiteGrid, { global: { stubs } })
}

describe('SiteGrid 渲染不变量', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seed()
  })

  it('全部模式下按分组分段渲染全部卡片', () => {
    const wrapper = mountGrid()
    expect(wrapper.findAll('.site-card-stub')).toHaveLength(SITES.length)
    // 两个分组各一个 group-section
    expect(wrapper.findAll('.group-section')).toHaveLength(2)
  })

  it('搜索关键字过滤卡片', () => {
    const { config } = seed()
    config.searchKeywords.sites = 'bravo'
    const wrapper = mountGrid()
    expect(wrapper.findAll('.site-card-stub')).toHaveLength(1)
  })

  it('搜索匹配描述文本', () => {
    const { config } = seed()
    config.searchKeywords.sites = 'charlie desc'
    const wrapper = mountGrid()
    expect(wrapper.findAll('.site-card-stub')).toHaveLength(1)
  })

  it('多选分组只渲染选中分组', () => {
    const { config } = seed()
    config.config.tabGroups.sites = ['media']
    const wrapper = mountGrid()
    expect(wrapper.findAll('.site-card-stub')).toHaveLength(1)
  })

  it('布局模式落到网格容器类名', () => {
    const { config } = seed()
    for (const [layout, cls] of [
      ['compact', 'compact'],
      ['large', 'large'],
      ['list', 'list']
    ] as const) {
      config.config.layout = layout
      const wrapper = mountGrid()
      expect(wrapper.find(`.site-grid.${cls}`).exists()).toBe(true)
    }
  })

  it('无匹配结果时显示空状态', () => {
    const { config } = seed()
    config.searchKeywords.sites = 'zzz-nothing'
    const wrapper = mountGrid()
    expect(wrapper.findAll('.site-card-stub')).toHaveLength(0)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})
