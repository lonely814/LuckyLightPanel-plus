// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import fs from 'node:fs'
import path from 'node:path'
import App from '@/App.vue'
import { useConfigStore } from '@/stores/config'
import type { LayoutMode, TabType, ThemeMode } from '@/types'

const BACKEND = path.resolve(__dirname, '../public/backend')
const fixture = (name: string) => JSON.parse(fs.readFileSync(path.join(BACKEND, name), 'utf8'))

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
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: unknown) => {
      const url = String(input)
      const key = Object.keys(ROUTES).find(k => url.endsWith(k))
      if (!key) return { ok: false, json: async () => null } as unknown as Response
      return { ok: true, json: async () => ROUTES[key] } as unknown as Response
    })
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const THEMES: ThemeMode[] = ['light', 'dark']
const LAYOUTS: LayoutMode[] = ['card', 'compact']
const TABS: TabType[] = ['sites', 'docker', 'luckyServices']

describe('3 tab × 2 布局 × 2 主题 = 12 组合冒烟', () => {
  it('每个组合都能渲染出至少一张卡片，且属性正确', async () => {
    const wrapper = mount(App, { attachTo: document.body })
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 600))
    await flushPromises()

    const store = useConfigStore()
    const root = document.documentElement
    const results: string[] = []

    for (const tab of TABS) {
      for (const layout of LAYOUTS) {
        for (const theme of THEMES) {
          const setLayout =
            tab === 'docker'
              ? store.setDockerLayout
              : tab === 'luckyServices'
                ? store.setLuckyServicesLayout
                : store.setLayout
          store.setCurrentTab(tab)
          setLayout(layout)
          store.setTheme(theme)
          await flushPromises()

          expect(root.getAttribute('data-theme')).toBe(theme)
          expect(root.getAttribute('data-layout')).toBe(layout)

          const cards = wrapper.findAll('.auto-grid > *')
          expect(cards.length).toBeGreaterThan(0)
          results.push(`${tab}/${layout}/${theme}: ${cards.length} cards`)
        }
      }
    }

    // 打印一次，作为 12 组合的可读证据
    console.log(results.join('\n'))
    wrapper.unmount()
  })
})
