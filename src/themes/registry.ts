/* ============================================
   主题注册表 - 主题元数据的单一来源
   ============================================ */

import type { Component } from 'vue'
import { Sun, Moon, Triangle, Terminal, Lightbulb, SlidersHorizontal, Receipt, CloudSnow } from 'lucide-vue-next'
import { THEME_IDS } from '@/types'
import type { ThemeMode } from '@/types'
import TechBackground from '@/components/common/TechBackground.vue'
import BauhausBackground from '@/components/common/BauhausBackground.vue'
import CRTBackground from '@/components/common/CRTBackground.vue'
import DotMatrixBackground from '@/components/common/DotMatrixBackground.vue'
import ConsoleBackground from '@/components/common/ConsoleBackground.vue'
import ReceiptBackground from '@/components/common/ReceiptBackground.vue'
import AuroraBackground from '@/components/common/AuroraBackground.vue'

/** 主题选项元数据 */
export interface ThemeOption {
  value: ThemeMode
  label: string
  icon: Component
  color: string
  backgroundComponent: Component
}

/** 主题元数据表（key 必须是 THEME_IDS 中的主题） */
const THEME_META: Record<ThemeMode, Omit<ThemeOption, 'value'>> = {
  light: {
    label: '浅色',
    icon: Sun,
    color: 'var(--warning)',
    backgroundComponent: TechBackground
  },
  dark: {
    label: '深色',
    icon: Moon,
    color: 'var(--neon-purple)',
    backgroundComponent: TechBackground
  },
  bauhaus: {
    label: '包豪斯',
    icon: Triangle,
    color: 'var(--bauhaus-red)',
    backgroundComponent: BauhausBackground
  },
  'crt-terminal': {
    label: '复古终端',
    icon: Terminal,
    color: 'var(--crt-green)',
    backgroundComponent: CRTBackground
  },
  'light-panel': {
    label: '光牌点阵',
    icon: Lightbulb,
    color: 'var(--lp-amber)',
    backgroundComponent: DotMatrixBackground
  },
  console: {
    label: '调光控制台',
    icon: SlidersHorizontal,
    color: 'var(--cs-backlit)',
    backgroundComponent: ConsoleBackground
  },
  receipt: {
    label: '运维小票',
    icon: Receipt,
    color: 'var(--r-stamp)',
    backgroundComponent: ReceiptBackground
  },
  'arctic-aurora': {
    label: '冰川极光',
    icon: CloudSnow,
    color: 'var(--aa-aurora-cyan)',
    backgroundComponent: AuroraBackground
  }
}

/** 主题选项列表（顺序与 THEME_IDS 一致） */
export const THEMES: ThemeOption[] = THEME_IDS.map(id => ({
  value: id,
  ...THEME_META[id]
}))

/** 有效主题 ID 列表（从注册表推导，供配置校验使用） */
export const VALID_THEMES: ThemeMode[] = THEMES.map(t => t.value)

/** 根据主题 ID 查找选项 */
export function getTheme(value: string): ThemeOption | undefined {
  return THEMES.find(t => t.value === value)
}
