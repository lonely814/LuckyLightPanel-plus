// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import fs from 'node:fs'
import path from 'node:path'
import App from '@/App.vue'

const BACKEND = path.resolve(__dirname, '../public/backend')

function fixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(BACKEND, name), 'utf8'))
}

const ROUTES: Record<string, unknown> = {
  'nav.json': fixture('nav.json'),
  'sites.json': fixture('sites.json'),
  'docker.json': fixture('docker.json'),
  'luckyservices.json': fixture('luckyservices.json'),
  'docker-stats.json': fixture('docker-stats.json'),
  'luckyservices-stats.json': fixture('luckyservices-stats.json'),
  'default-config.json': fixture('default-config.json'),
  'api/network-type': { networkType: 'internal', clientIP: '192.168.1.10' }
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.removeAttribute('data-layout')
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const url = String(input)
      const key = Object.keys(ROUTES).find(k => url.endsWith(`/backend/${k}`) || url.endsWith(k))
      if (!key) return { ok: false, json: async () => null } as unknown as Response
      return { ok: true, json: async () => ROUTES[key] } as unknown as Response
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('App 冒烟', () => {
  it('挂载后写入 data-theme / data-layout 并渲染站点', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    // 500ms 最短 loading
    await new Promise(resolve => setTimeout(resolve, 600))
    await flushPromises()

    const root = document.documentElement
    expect(root.getAttribute('data-theme')).toBe('dark')
    expect(root.getAttribute('data-layout')).toBe('card')

    const nav = fixture('nav.json') as { settings: { title: string } }
    expect(wrapper.text()).toContain(nav.settings.title)
    const sites = fixture('sites.json') as { sites: { name: string }[] }
    expect(wrapper.text()).toContain(sites.sites[0].name)

    wrapper.unmount()
  })

  it('主题与布局切换会同步到 <html> 属性', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 600))
    await flushPromises()

    const { useConfigStore } = await import('@/stores/config')
    const store = useConfigStore()

    store.setTheme('light')
    await flushPromises()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    store.setLayout('compact')
    await flushPromises()
    expect(document.documentElement.getAttribute('data-layout')).toBe('compact')

    // 细节比例落到 CSS 变量上
    store.updateConfig('detailTextContrast', 130)
    await flushPromises()
    expect(document.documentElement.style.getPropertyValue('--text-factor')).toBe('1.300')

    wrapper.unmount()
  })
})
