/* ============================================
   液态玻璃预设
   数值取自 aethercss (aethercss.lovable.app) 的 liquidglass 预设表。
   只保留本面板真正用到的四项：噪声频率 / 位移强度 / 磨砂模糊 / 内发光。
   ponytail: 外阴影 (shadowSpread/shadowBlur) 12 个预设全是 -8/21，
   由主题的 --site-card-shadow 负责，这里不重复。 */
export interface LiquidPreset {
  id: string
  label: string
  /** feTurbulence baseFrequency */
  noise: number
  /** feDisplacementMap scale */
  distortion: number
  /** ::after 的 backdrop blur */
  blur: number
  /** ::after 内发光 box-shadow 的 spread（负值=内缩） */
  innerSize: number
  /** 内发光模糊半径 */
  innerBlur: number
}

export const LIQUID_PRESETS: LiquidPreset[] = [
  { id: 'liquid-crystal', label: 'Liquid Crystal', noise: 0.012, distortion: 85, blur: 0, innerSize: -8, innerBlur: 5 },
  { id: 'fluid-amber', label: 'Fluid Amber', noise: 0.018, distortion: 120, blur: 12, innerSize: -8, innerBlur: 4 },
  { id: 'ice-ripple', label: 'Ice Ripple', noise: 0.025, distortion: 65, blur: 6, innerSize: -2, innerBlur: 12 },
  { id: 'mercury-drop', label: 'Mercury Drop', noise: 0.008, distortion: 150, blur: 15, innerSize: -4, innerBlur: 12 },
  { id: 'ocean-wave', label: 'Ocean Wave', noise: 0.015, distortion: 95, blur: 10, innerSize: -8, innerBlur: 4 },
  { id: 'crystal-mist', label: 'Crystal Mist', noise: 0.02, distortion: 110, blur: 14, innerSize: -2, innerBlur: 8 },
  { id: 'molten-glass', label: 'Molten Glass', noise: 0.03, distortion: 140, blur: 8, innerSize: -6, innerBlur: 10 },
  { id: 'silk-veil', label: 'Silk Veil', noise: 0.006, distortion: 45, blur: 18, innerSize: -3, innerBlur: 6 },
  { id: 'plasma-flow', label: 'Plasma Flow', noise: 0.035, distortion: 180, blur: 4, innerSize: -10, innerBlur: 3 },
  { id: 'frost-lens', label: 'Frost Lens', noise: 0.01, distortion: 55, blur: 22, innerSize: -4, innerBlur: 14 },
  { id: 'aurora-gel', label: 'Aurora Gel', noise: 0.022, distortion: 100, blur: 11, innerSize: -5, innerBlur: 7 },
  { id: 'nebula-prism', label: 'Nebula Prism', noise: 0.028, distortion: 130, blur: 16, innerSize: -7, innerBlur: 9 }
]

export const DEFAULT_LIQUID_PRESET = 'ice-ripple'

/** 应用预设：SVG 滤镜属性用 setAttribute（滤镜原语不吃 CSS 变量），尺寸走 CSS 变量 */
export function applyLiquidPreset(id: string) {
  const preset = LIQUID_PRESETS.find(p => p.id === id) ?? LIQUID_PRESETS[2]
  const turbulence = document.querySelector('#glass-distortion feTurbulence')
  const displacement = document.querySelector('#glass-distortion feDisplacementMap')
  turbulence?.setAttribute('baseFrequency', `${preset.noise} ${preset.noise}`)
  displacement?.setAttribute('scale', String(preset.distortion))

  const style = document.documentElement.style
  style.setProperty('--liquid-blur', `${preset.blur}px`)
  style.setProperty('--liquid-inner-size', `${preset.innerSize}px`)
  style.setProperty('--liquid-inner-blur', `${preset.innerBlur}px`)
}
