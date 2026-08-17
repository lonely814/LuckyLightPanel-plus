<script setup lang="ts">
import { computed, ref } from 'vue'
import { useConfigStore, PRESET_BACKGROUNDS } from '@/stores/config'
import { X, RotateCcw, Palette, Eye, Check, Image, Github, Search, Globe, SlidersVertical } from 'lucide-vue-next'
import { THEMES } from '@/themes/registry'

// 导入本地图标
import iconBing from '@/assets/icons/bing.png'
import iconGoogle from '@/assets/icons/google.ico'
import iconBaidu from '@/assets/icons/baidu.ico'
import iconSogou from '@/assets/icons/sogou.ico'
import icon360 from '@/assets/icons/so.ico'
import iconGithub from '@/assets/icons/github.ico'

const configStore = useConfigStore()

const isOpen = computed(() => configStore.settingsPanelOpen)

// 服务器背景图片
const serverBackgrounds = computed(() => configStore.serverBackgrounds)

function close() {
  configStore.toggleSettingsPanel(false)
}

// 主题选项（来自注册表）
const themeOptions = THEMES

// 搜索引擎选项（与 SearchBar.vue 保持一致）
const SEARCH_ENGINES = [
  { id: 'bing', name: 'Bing', icon: iconBing },
  { id: 'google', name: 'Google', icon: iconGoogle },
  { id: 'baidu', name: '百度', icon: iconBaidu },
  { id: 'sogou', name: '搜狗', icon: iconSogou },
  { id: '360', name: '360搜索', icon: icon360 },
  { id: 'github', name: 'GitHub', icon: iconGithub }
]

// 自定义搜索 URL 输入
const customSearchUrlInput = ref(configStore.customSearchUrl)

// 保存自定义搜索 URL
function saveCustomSearchUrl() {
  configStore.setCustomSearchUrl(customSearchUrlInput.value)
}

// 布局缩放
function onLayoutScaleInput(e: Event) {
  const target = e.target as HTMLInputElement
  configStore.setLayoutScale(Number(target.value))
}

const layoutScalePercent = computed(() => Math.round(configStore.layoutScale * 100))

// ============ 站点卡片 ============

// 站点卡片尺寸滑块
function onSiteCardSizeInput(e: Event) {
  const target = e.target as HTMLInputElement
  configStore.setSiteCardSize(Number(target.value))
}

const siteCardSizeValue = computed(() => Math.round(configStore.siteCardSize))

// 切换方形 / 矩形模式
function setSiteCardShape(shape: 'square' | 'rect') {
  configStore.setSiteCardShape(shape)
}

// ============ 细节调整 ============

type DetailField =
  | 'detailTextContrast'
  | 'detailRadiusScale'
  | 'detailGlassBlurScale'
  | 'detailGlassOpacityScale'

const DETAIL_RANGES: Record<DetailField, { min: number; max: number; hint: string }> = {
  detailTextContrast: { min: 80, max: 130, hint: '增强或减弱文字可读性' },
  detailRadiusScale: { min: 60, max: 150, hint: '卡片与面板的圆润程度' },
  detailGlassBlurScale: { min: 25, max: 200, hint: '毛玻璃背景模糊强度' },
  detailGlassOpacityScale: { min: 50, max: 150, hint: '卡片与面板的透明程度' }
}

function onDetailInput(field: DetailField, e: Event) {
  const target = e.target as HTMLInputElement
  configStore.updateConfig(field, Number(target.value))
}

function resetDetails() {
  configStore.updateConfig('detailTextContrast', 100)
  configStore.updateConfig('detailRadiusScale', 100)
  configStore.updateConfig('detailGlassBlurScale', 100)
  configStore.updateConfig('detailGlassOpacityScale', 100)
  configStore.updateConfig('detailReduceMotion', false)
}

</script>

<template>
  <!-- 遮罩层 -->
  <Transition
    enter-active-class="overlay-enter"
    enter-from-class="overlay-enter-from"
    enter-to-class="overlay-enter-to"
    leave-active-class="overlay-leave"
    leave-from-class="overlay-leave-from"
    leave-to-class="overlay-leave-to"
  >
    <div v-if="isOpen" class="settings-overlay" @click="close" />
  </Transition>

  <!-- 设置面板 -->
  <Transition
    enter-active-class="panel-enter"
    enter-from-class="panel-enter-from"
    enter-to-class="panel-enter-to"
    leave-active-class="panel-leave"
    leave-from-class="panel-leave-from"
    leave-to-class="panel-leave-to"
  >
    <div v-if="isOpen" class="settings-panel cyber-panel">
      <!-- 霓虹边框效果 -->
      <div class="panel-border-glow" />
      <div class="panel-border-blur" />
      
      <!-- 头部 -->
      <div class="panel-header">
        <h2 class="panel-title">
          <div class="title-icon-box">
            <span>⚙️</span>
          </div>
          设置
        </h2>
        <button class="close-btn" @click="close">
          <X class="close-icon" />
        </button>
      </div>

      <!-- 内容区 -->
      <div class="panel-content">
        <!-- 主题设置 -->
        <section class="settings-section">
          <div class="section-header">
            <Palette class="section-icon cyan" />
            <h3 class="section-title">主题</h3>
          </div>
          <div class="theme-grid">
            <button
              v-for="option in themeOptions"
              :key="option.value"
              class="theme-option"
              :class="{ active: configStore.theme === option.value }"
              @click="configStore.setTheme(option.value)"
            >
              <!-- 选中指示器 -->
              <div 
                v-if="configStore.theme === option.value"
                class="option-check"
                :style="{ backgroundColor: `hsl(${option.color})`, boxShadow: `0 0 10px hsl(${option.color})` }"
              >
                <Check class="check-icon" />
              </div>
              
              <div 
                class="option-icon-box"
                :class="{ active: configStore.theme === option.value }"
                :style="configStore.theme === option.value ? { backgroundColor: `hsl(${option.color})`, boxShadow: `0 0 15px hsl(${option.color} / 0.5)` } : {}"
              >
                <component :is="option.icon" class="option-icon" />
              </div>
              <span class="option-label" :class="{ active: configStore.theme === option.value }">{{ option.label }}</span>
            </button>
          </div>
        </section>

        <!-- 背景设置 -->
        <section class="settings-section">
          <div class="section-header">
            <span class="section-emoji">🌅</span>
            <h3 class="section-title">背景</h3>
          </div>
          <div class="bg-grid">
            <button
              v-for="bg in PRESET_BACKGROUNDS"
              :key="bg.id"
              class="bg-option"
              :class="{ active: configStore.config.background === bg.id }"
              :style="{ background: bg.value, boxShadow: configStore.config.background === bg.id ? '0 0 15px hsl(var(--neon-cyan) / 0.5)' : 'none' }"
              :title="bg.name"
              @click="configStore.setBackground(bg.id)"
            >
              <!-- 选中标记 -->
              <div v-if="configStore.config.background === bg.id" class="bg-check">
                <Check class="bg-check-icon" />
              </div>
            </button>
          </div>
          
          <!-- 服务器背景图片 -->
          <template v-if="serverBackgrounds.length > 0">
            <div class="section-header sub-header">
              <Image class="section-icon green" />
              <h4 class="section-subtitle">服务器图片</h4>
            </div>
            <div class="bg-grid">
              <button
                v-for="bg in serverBackgrounds"
                :key="bg.id"
                class="bg-option bg-image-option"
                :class="{ active: configStore.config.background === bg.id }"
                :style="{ backgroundImage: `url(${bg.value})`, boxShadow: configStore.config.background === bg.id ? '0 0 15px hsl(var(--neon-cyan) / 0.5)' : 'none' }"
                :title="bg.name"
                @click="configStore.setBackground(bg.id)"
              >
                <!-- 选中标记 -->
                <div v-if="configStore.config.background === bg.id" class="bg-check">
                  <Check class="bg-check-icon" />
                </div>
              </button>
            </div>
          </template>
        </section>

        <!-- 显示设置 -->
        <section class="settings-section">
          <div class="section-header">
            <Eye class="section-icon blue" />
            <h3 class="section-title">显示</h3>
          </div>
          <div class="toggle-options">
            <!-- 显示页头 -->
            <label class="toggle-item">
              <span class="toggle-label">显示页头</span>
              <div 
                class="switch-modern"
                :class="{ active: configStore.showHeader }"
                @click="configStore.updateConfig('showHeader', !configStore.showHeader)"
              />
            </label>
            <!-- 隐藏页头时的提示 -->
            <p v-if="!configStore.showHeader" class="toggle-hint">
              关闭后可在页面右上角找到设置入口
            </p>
            
            <!-- 显示描述 -->
            <label class="toggle-item">
              <span class="toggle-label">显示描述</span>
              <div 
                class="switch-modern"
                :class="{ active: configStore.showDescription }"
                @click="configStore.updateConfig('showDescription', !configStore.showDescription)"
              />
            </label>
            
            <!-- 显示时间 -->
            <label class="toggle-item">
              <span class="toggle-label">显示时间</span>
              <div 
                class="switch-modern"
                :class="{ active: configStore.showTime }"
                @click="configStore.updateConfig('showTime', !configStore.showTime)"
              />
            </label>

            <!-- 布局比例 -->
            <label class="toggle-item scale-item">
              <span class="toggle-label">布局比例</span>
              <div class="scale-control">
                <input
                  type="range"
                  class="scale-slider"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  :value="configStore.layoutScale"
                  :title="`布局缩放：${layoutScalePercent}%`"
                  @input="onLayoutScaleInput"
                />
                <span class="scale-value">{{ layoutScalePercent }}%</span>
              </div>
            </label>
            <p class="toggle-hint">
              缩放内容区大小，100% 为默认；过大时可放大卡片便于阅读
            </p>

            <!-- 站点卡片尺寸 -->
            <label class="toggle-item scale-item">
              <span class="toggle-label">站点卡片尺寸</span>
              <div class="scale-control">
                <input
                  type="range"
                  class="scale-slider"
                  min="70"
                  max="150"
                  step="5"
                  :value="configStore.siteCardSize"
                  :title="`站点卡片尺寸：${siteCardSizeValue}%`"
                  @input="onSiteCardSizeInput"
                />
                <span class="scale-value">{{ siteCardSizeValue }}%</span>
              </div>
            </label>

            <!-- 方形 / 矩形切换 -->
            <label class="toggle-item scale-item">
              <span class="toggle-label">卡片形状</span>
              <div class="shape-toggle">
                <button
                  class="shape-btn"
                  :class="{ active: configStore.siteCardShape === 'square' }"
                  @click="setSiteCardShape('square')"
                >
                  <span class="shape-icon square-shape" />
                  方形
                </button>
                <button
                  class="shape-btn"
                  :class="{ active: configStore.siteCardShape === 'rect' }"
                  @click="setSiteCardShape('rect')"
                >
                  <span class="shape-icon rect-shape" />
                  矩形
                </button>
              </div>
            </label>
          </div>
        </section>

        <!-- 细节设置 -->
        <section class="settings-section">
          <div class="section-header">
            <SlidersVertical class="section-icon purple" />
            <h3 class="section-title">细节</h3>
            <button class="detail-reset" @click="resetDetails">还原</button>
          </div>
          <div class="toggle-options">
            <label
              v-for="(range, field) in DETAIL_RANGES"
              :key="field"
              class="toggle-item scale-item"
            >
              <span class="toggle-label">{{ field === 'detailTextContrast' ? '文字对比度' : field === 'detailRadiusScale' ? '圆角大小' : field === 'detailGlassBlurScale' ? '玻璃模糊' : '卡片不透明度' }}</span>
              <div class="scale-control">
                <input
                  type="range"
                  class="scale-slider"
                  :min="range.min"
                  :max="range.max"
                  step="5"
                  :value="configStore.config[field]"
                  :title="`${configStore.config[field]}% · ${range.hint}`"
                  @input="onDetailInput(field, $event)"
                />
                <span class="scale-value">{{ configStore.config[field] }}%</span>
              </div>
            </label>

            <!-- 减弱动效 -->
            <label class="toggle-item">
              <span class="toggle-label">减弱动效</span>
              <div
                class="switch-modern"
                :class="{ active: configStore.config.detailReduceMotion }"
                @click="configStore.updateConfig('detailReduceMotion', !configStore.config.detailReduceMotion)"
              />
            </label>
          </div>
          <p class="toggle-hint">
            100% 为各主题默认值；调整后对所有主题生效
          </p>
        </section>

        <!-- 搜索设置 -->
        <section class="settings-section">
          <div class="section-header">
            <Search class="section-icon cyan" />
            <h3 class="section-title">搜索</h3>
          </div>
          
          <!-- 显示搜索栏开关 -->
          <div class="toggle-options">
            <label class="toggle-item">
              <span class="toggle-label">显示搜索栏</span>
              <div 
                class="switch-modern"
                :class="{ active: configStore.showSearch }"
                @click="configStore.updateConfig('showSearch', !configStore.showSearch)"
              />
            </label>
          </div>
          
          <!-- 搜索引擎选择 -->
          <template v-if="configStore.showSearch">
            <div class="section-header sub-header">
              <Globe class="section-icon purple" />
              <h4 class="section-subtitle">搜索引擎</h4>
            </div>
            <div class="engine-grid">
              <button
                v-for="engine in SEARCH_ENGINES"
                :key="engine.id"
                class="engine-option-btn"
                :class="{ active: configStore.searchEngine === engine.id }"
                @click="configStore.setSearchEngine(engine.id)"
              >
                <img :src="engine.icon" :alt="engine.name" class="engine-icon-img" />
                <span class="engine-name">{{ engine.name }}</span>
                <Check v-if="configStore.searchEngine === engine.id" class="engine-check" />
              </button>
            </div>
            
            <!-- 自定义搜索引擎 -->
            <div class="custom-engine-section">
              <button
                class="engine-option-btn custom-btn"
                :class="{ active: configStore.searchEngine === 'custom' }"
                @click="configStore.setSearchEngine('custom')"
              >
                <span class="engine-icon">⚡</span>
                <span class="engine-name">自定义</span>
                <Check v-if="configStore.searchEngine === 'custom'" class="engine-check" />
              </button>
              
              <!-- 自定义 URL 输入框 -->
              <div v-if="configStore.searchEngine === 'custom'" class="custom-url-input">
                <input 
                  v-model="customSearchUrlInput"
                  type="text"
                  class="url-input"
                  placeholder="输入搜索 URL，用 {query} 代替搜索词"
                  @blur="saveCustomSearchUrl"
                  @keyup.enter="saveCustomSearchUrl"
                />
                <p class="url-hint">例如: https://www.bing.com/search?q={query}</p>
              </div>
            </div>
          </template>
        </section>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <button class="reset-btn" @click="configStore.resetConfig()">
          <RotateCcw class="reset-icon" />
          <span>重置所有设置</span>
        </button>
        
        <!-- 开源地址 -->
        <a 
          href="https://github.com/gdy666/LuckyLightPanel" 
          target="_blank" 
          rel="noopener noreferrer"
          class="github-link"
        >
          <Github class="github-icon" />
          <span>开源地址</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* 遮罩层 */
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.15);
}

.overlay-enter { transition: opacity 300ms; }
.overlay-enter-from { opacity: 0; }
.overlay-enter-to { opacity: 1; }
.overlay-leave { transition: opacity 200ms; }
.overlay-leave-from { opacity: 1; }
.overlay-leave-to { opacity: 0; }

/* 设置面板 */
.settings-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 200;
  height: 100%;
  width: 360px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

.cyber-panel {
  background: hsl(var(--bg-elevated));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
}

.panel-enter { transition: all 400ms ease-out; }
.panel-enter-from { transform: translateX(100%); opacity: 0; }
.panel-enter-to { transform: translateX(0); opacity: 1; }
.panel-leave { transition: all 300ms ease-in; }
.panel-leave-from { transform: translateX(0); opacity: 1; }
.panel-leave-to { transform: translateX(100%); opacity: 0; }

/* 霓虹边框效果 */
.panel-border-glow {
  position: absolute;
  inset: 0;
  left: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, hsl(var(--neon-cyan) / 0.5), transparent);
}

.panel-border-blur {
  position: absolute;
  inset: 0;
  left: 0;
  width: 2px;
  filter: blur(4px);
  background: linear-gradient(to bottom, transparent, hsl(var(--neon-cyan) / 0.8), transparent);
}

/* 头部 */
.panel-header {
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid hsl(var(--neon-cyan) / 0.2);
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: hsl(var(--text-primary));
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon-box {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px hsl(var(--neon-cyan) / 0.4);
}

.title-icon-box span {
  font-size: 0.875rem;
  color: white;
}

.close-btn {
  padding: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--glass-border));
  background: hsl(var(--glass-bg));
  color: hsl(var(--text-muted));
  transition: all 200ms;
}

.close-btn:hover {
  color: hsl(var(--neon-pink));
  border-color: hsl(var(--neon-pink) / 0.4);
  transform: rotate(90deg);
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* 内容区 */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 设置区块 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: hsl(var(--text-secondary));
}

.section-icon {
  width: 1rem;
  height: 1rem;
}

.section-icon.blue { color: hsl(var(--neon-blue)); }
.section-icon.green { color: hsl(var(--success)); }

.section-emoji {
  color: hsl(var(--neon-purple));
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.sub-header {
  margin-top: 0.5rem;
}

.section-subtitle {
  font-size: 0.8125rem;
  font-weight: 500;
  color: hsl(var(--text-muted));
}

/* 主题网格 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.theme-option {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid hsl(var(--glass-border));
  background: hsl(var(--glass-bg));
  overflow: hidden;
  transition: all 200ms;
}

.theme-option:hover {
  background: hsl(var(--glass-bg-hover));
  border-color: hsl(var(--neon-cyan) / 0.3);
}

.theme-option.active {
  border-color: hsl(var(--neon-cyan) / 0.5);
  background: hsl(var(--neon-cyan) / 0.1);
}

.option-check {
  position: absolute;
  top: 0.375rem;
  right: 0.375rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-icon {
  width: 0.625rem;
  height: 0.625rem;
  color: white;
}

.option-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms;
  background: hsl(var(--glass-bg));
  color: hsl(var(--text-muted));
}

.option-icon-box.active {
  color: white;
}

.theme-option:hover .option-icon-box {
  transform: scale(1.1);
}

.option-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.option-label {
  font-size: 0.75rem;
  color: hsl(var(--text-muted));
}

.option-label.active {
  color: hsl(var(--text-primary));
}

/* 背景网格 */
.bg-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.bg-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 200ms;
  border: 2px solid transparent;
  opacity: 0.7;
}

.bg-option:hover {
  transform: scale(1.05);
  opacity: 1;
}

.bg-option.active {
  border-color: hsl(var(--neon-cyan));
  transform: scale(1.05);
  opacity: 1;
}

.bg-image-option {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bg-check {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.bg-check-icon {
  width: 1rem;
  height: 1rem;
  color: white;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.2));
}

/* 开关选项 */
.toggle-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: hsl(var(--glass-bg));
  border: 1px solid hsl(var(--glass-border));
  cursor: pointer;
  transition: background 200ms;
}

.toggle-item:hover {
  background: hsl(var(--glass-bg-hover));
}

.toggle-label {
  font-size: 0.875rem;
  color: hsl(var(--text-secondary));
}

.toggle-hint {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: hsl(var(--neon-cyan));
  background: hsl(var(--neon-cyan) / 0.1);
  border-radius: 0.5rem;
  border-left: 2px solid hsl(var(--neon-cyan) / 0.5);
}

/* 布局比例滑杆 */
.scale-item {
  cursor: default;
}

.scale-control {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.scale-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 7.5rem;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)));
  outline: none;
  cursor: pointer;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid hsl(var(--neon-cyan));
  box-shadow: 0 0 8px hsl(var(--neon-cyan) / 0.6);
  cursor: grab;
  transition: transform 150ms;
}

.scale-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.scale-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid hsl(var(--neon-cyan));
  box-shadow: 0 0 8px hsl(var(--neon-cyan) / 0.6);
  cursor: grab;
}

.scale-slider::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)));
}

.scale-value {
  min-width: 2.75rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--neon-cyan));
  font-variant-numeric: tabular-nums;
}

/* 站点卡片形状切换 */
.shape-toggle {
  display: flex;
  gap: 0.375rem;
}

.shape-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid hsl(var(--glass-border));
  background: hsl(var(--glass-bg));
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
  cursor: pointer;
  transition: all 200ms;
}

.shape-btn:hover {
  border-color: hsl(var(--neon-cyan) / 0.3);
}

.shape-btn.active {
  border-color: hsl(var(--neon-cyan) / 0.5);
  background: hsl(var(--neon-cyan) / 0.1);
  color: hsl(var(--neon-cyan));
}

.shape-icon {
  width: 0.875rem;
  height: 0.875rem;
  border: 1.5px solid currentColor;
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.shape-btn.active .shape-icon {
  box-shadow: 0 0 6px hsl(var(--neon-cyan) / 0.5);
}

.shape-btn .shape-icon.rect-shape {
  width: 1.125rem;
  height: 0.75rem;
  border-radius: 0.25rem;
}

/* 搜索引擎网格 */
.engine-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.engine-option-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.625rem;
  border: 1px solid hsl(var(--glass-border));
  background: hsl(var(--glass-bg));
  cursor: pointer;
  transition: all 200ms;
}

.engine-option-btn:hover {
  background: hsl(var(--glass-bg-hover));
  border-color: hsl(var(--neon-cyan) / 0.3);
}

.engine-option-btn.active {
  border-color: hsl(var(--neon-cyan) / 0.5);
  background: hsl(var(--neon-cyan) / 0.1);
}

.engine-icon-img {
  width: 1rem;
  height: 1rem;
  object-fit: contain;
  flex-shrink: 0;
}

.engine-name {
  flex: 1;
  font-size: 0.75rem;
  color: hsl(var(--text-secondary));
  text-align: left;
}

.engine-option-btn.active .engine-name {
  color: hsl(var(--neon-cyan));
}

.engine-check {
  width: 0.75rem;
  height: 0.75rem;
  color: hsl(var(--neon-cyan));
}

/* 自定义搜索引擎 */
.custom-engine-section {
  margin-top: 0.75rem;
}

.custom-btn {
  width: 100%;
}

.custom-url-input {
  margin-top: 0.625rem;
}

.url-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border-radius: 0.625rem;
  border: 1px solid hsl(var(--glass-border));
  background: hsl(var(--glass-bg));
  color: hsl(var(--text-primary));
  font-size: 0.8125rem;
  outline: none;
  transition: all 200ms;
}

.url-input:focus {
  border-color: hsl(var(--neon-cyan) / 0.5);
  box-shadow: 0 0 10px hsl(var(--neon-cyan) / 0.1);
}

.url-input::placeholder {
  color: hsl(var(--text-muted));
}

.url-hint {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
}

/* 图标颜色 */
.section-icon.cyan { color: hsl(var(--neon-cyan)); }
.section-icon.purple { color: hsl(var(--neon-purple)); }

/* 细节还原按钮 */
.detail-reset {
  margin-left: auto;
  padding: 0.125rem 0.5rem;
  border: 1px solid hsl(var(--glass-border));
  border-radius: 0.375rem;
  background: hsl(var(--glass-bg));
  font-size: 0.6875rem;
  color: hsl(var(--text-muted));
  cursor: pointer;
  transition: all 200ms;
}

.detail-reset:hover {
  color: hsl(var(--neon-cyan));
  border-color: hsl(var(--neon-cyan) / 0.4);
}

/* 底部 */
.panel-footer {
  flex-shrink: 0;
  padding: 1.25rem;
  border-top: 1px solid hsl(var(--neon-cyan) / 0.2);
}

.reset-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: hsl(var(--error) / 0.1);
  border: 1px solid hsl(var(--error) / 0.3);
  color: hsl(var(--error));
  box-shadow: 0 0 10px hsl(var(--error) / 0.1);
  transition: all 200ms;
}

.reset-btn:hover {
  background: hsl(var(--error) / 0.2);
  border-color: hsl(var(--error) / 0.5);
}

.reset-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 500ms;
}

.reset-btn:hover .reset-icon {
  transform: rotate(-180deg);
}

/* 开源地址链接 */
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: hsl(var(--text-muted));
  text-decoration: none;
  transition: all 200ms;
}

.github-link:hover {
  color: hsl(var(--text-primary));
  background: hsl(var(--glass-bg-hover));
}

.github-icon {
  width: 1rem;
  height: 1rem;
}
</style>
