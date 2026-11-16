// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DockerGrid from './DockerGrid.vue'
import ServiceGrid from '../luckyServices/ServiceGrid.vue'
import { useNavStore } from '@/stores/nav'
import { useConfigStore } from '@/stores/config'
import type { DockerContainer, LuckyService } from '@/types'

// 图标与统计轮询在测试中不参与断言
vi.mock('@/utils/siteLinks', async orig => {
  const mod = await orig<typeof import('@/utils/siteLinks')>()
  return { ...mod, resolveSiteIcon: () => '' }
})

const stubs = {
  SearchBox: true,
  GroupDropdown: true,
  DataLayoutSwitcher: true,
  DockerOverview: true,
  DockerCard: { template: '<div class="docker-card-stub" />' },
  ServiceCard: { template: '<div class="service-card-stub" />' }
}

function container(key: string, name: string, groupKey: string): DockerContainer {
  return { key, containerName: name, displayName: name, groupKey, state: 'running', enable: true, order: 1 }
}

function service(key: string, name: string, groupKey: string): LuckyService {
  return {
    key,
    name,
    displayName: name,
    description: `${name} desc`,
    groupKey,
    enable: true,
    order: 1
  } as LuckyService
}

const CONTAINERS = [container('a', 'alpha', 'app'), container('b', 'bravo', 'app'), container('c', 'charlie', 'db')]
const SERVICES = [service('a', 'alpha', 'proxy'), service('b', 'bravo', 'proxy'), service('c', 'charlie', 'stun')]

function seed() {
  const nav = useNavStore()
  const config = useConfigStore()

  nav.dockerData = {
    groups: [
      { key: 'app', name: '应用' },
      { key: 'db', name: '数据库' }
    ],
    containers: CONTAINERS
  }
  nav.luckyServicesData = {
    groups: [
      { key: 'proxy', name: '端口转发' },
      { key: 'stun', name: 'STUN' }
    ],
    services: SERVICES
  }
  nav.networkType = 'external'
  nav.networkTypeFetchFailed = false

  config.config.tabGroups = { sites: 'all', docker: 'all', luckyServices: 'all' }
  config.config.currentTab = 'docker' // 分组选择读 tabGroups[currentTab]
  config.searchKeywords.docker = ''
  config.searchKeywords.luckyServices = ''
  return { nav, config }
}

describe('DockerGrid 渲染不变量', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seed()
  })

  it('全部模式按分组渲染全部容器', () => {
    const wrapper = mount(DockerGrid, { global: { stubs } })
    expect(wrapper.findAll('.docker-card-stub')).toHaveLength(CONTAINERS.length)
    expect(wrapper.findAll('.group-section')).toHaveLength(2)
  })

  it('搜索过滤容器', () => {
    const { config } = seed()
    config.searchKeywords.docker = 'bravo'
    const wrapper = mount(DockerGrid, { global: { stubs } })
    expect(wrapper.findAll('.docker-card-stub')).toHaveLength(1)
  })

  it('无匹配时显示空状态', () => {
    const { config } = seed()
    config.searchKeywords.docker = 'zzz'
    const wrapper = mount(DockerGrid, { global: { stubs } })
    expect(wrapper.findAll('.docker-card-stub')).toHaveLength(0)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})

describe('ServiceGrid 渲染不变量', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    seed().config.config.currentTab = 'luckyServices'
  })

  it('全部模式按分组渲染全部服务', () => {
    const wrapper = mount(ServiceGrid, { global: { stubs } })
    expect(wrapper.findAll('.service-card-stub')).toHaveLength(SERVICES.length)
    expect(wrapper.findAll('.group-section')).toHaveLength(2)
  })

  it('搜索过滤服务（命中描述）', () => {
    const { config } = seed()
    config.searchKeywords.luckyServices = 'charlie desc'
    const wrapper = mount(ServiceGrid, { global: { stubs } })
    expect(wrapper.findAll('.service-card-stub')).toHaveLength(1)
  })

  it('多选分组只渲染选中分组', () => {
    const { config } = seed()
    config.config.currentTab = 'luckyServices'
    config.config.tabGroups.luckyServices = ['stun']
    const wrapper = mount(ServiceGrid, { global: { stubs } })
    expect(wrapper.findAll('.service-card-stub')).toHaveLength(1)
  })

  it('无匹配时显示空状态', () => {
    const { config } = seed()
    config.searchKeywords.luckyServices = 'zzz'
    const wrapper = mount(ServiceGrid, { global: { stubs } })
    expect(wrapper.findAll('.service-card-stub')).toHaveLength(0)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})
