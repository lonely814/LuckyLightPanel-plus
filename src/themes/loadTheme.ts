/* ============================================
   主题样式按需加载
   首屏只加载 default.css（:root 变量），
   其余主题在切换到该主题时才 import()。
   新增主题：此处加一条 loader + main.css 说明。
   ============================================ */

import { THEME_IDS } from '@/types'
import type { ThemeMode } from '@/types'

/** _shared.css 收拢了这几个主题的字面重复块，必须一起加载 */
const SHARED = () => import('@/assets/styles/themes/_shared.css')

const LOADERS: Record<ThemeMode, () => Promise<unknown>> = {
  light: () => import('@/assets/styles/themes/light.css'),
  dark: () => import('@/assets/styles/themes/dark.css'),
  blueprint: () => import('@/assets/styles/themes/blueprint.css'),
  bauhaus: () => Promise.all([import('@/assets/styles/themes/bauhaus.css'), SHARED()]),
  'crt-terminal': () => Promise.all([import('@/assets/styles/themes/crt-terminal.css'), SHARED()]),
  'light-panel': () => Promise.all([import('@/assets/styles/themes/light-panel.css'), SHARED()]),
  console: () => Promise.all([import('@/assets/styles/themes/console.css'), SHARED()]),
  receipt: () => Promise.all([import('@/assets/styles/themes/receipt.css'), SHARED()]),
  'arctic-aurora': () => import('@/assets/styles/themes/arctic-aurora.css')
}

const loaded = new Set<ThemeMode>()

/** 确保某套主题的 CSS 已注入。重复调用只有第一次真的加载。 */
export async function loadTheme(theme: ThemeMode): Promise<void> {
  if (loaded.has(theme)) return
  await LOADERS[theme]()
  loaded.add(theme)
}

/**
 * 主题预览需要全部主题的变量同时在场，否则未加载的主题会取 :root 兜底值、预览全是同一种颜色。
 * 只在用户打开主题选择面板时调用，首屏仍然只加载当前主题。
 */
export async function loadAllThemes(): Promise<void> {
  await Promise.all(THEME_IDS.map(theme => loadTheme(theme)))
}
