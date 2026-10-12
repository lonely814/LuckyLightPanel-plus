<script setup lang="ts">
/**
 * 主题预览缩略图 - 不硬编码任何颜色
 * 原理：主题 CSS 用裸 [data-theme="x"] 属性选择器，属性匹配任意元素，
 * 所以在容器上挂 data-theme 即可让该主题的 CSS 变量在容器内生效。
 * 颜色取自 --primary / --neon-cyan / --accent / --bg-page / --text-primary，换主题无需改此组件。
 */
defineProps<{
  theme: string
  label: string
  active?: boolean
}>()
</script>

<template>
  <div class="theme-preview" :class="{ active }">
    <div class="preview-canvas" :data-theme="theme">
      <!-- 顶栏 -->
      <div class="pv-bar">
        <span class="pv-dot" />
        <span class="pv-title" />
      </div>
      <!-- 色块：大色块用 primary，小色块用强调色 -->
      <div class="pv-grid">
        <div class="pv-tile pv-tile-lg" />
        <div class="pv-tile pv-tile-accent" />
        <div class="pv-tile" />
      </div>
      <!-- 网格内容区 -->
      <div class="pv-cards">
        <div class="pv-card" />
        <div class="pv-card" />
        <div class="pv-card pv-card-accent" />
      </div>
    </div>
    <span class="preview-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.theme-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.preview-canvas {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 0.5rem;
  overflow: hidden;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  /* 用主题自己的页面底色 */
  background: hsl(var(--bg-page));
  border: 1px solid hsl(var(--border-subtle));
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.pv-bar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.25rem;
  border-radius: 0.25rem;
  background: hsl(var(--card-bg));
}

.pv-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: hsl(var(--primary));
}

.pv-title {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: hsl(var(--text-muted));
  opacity: 0.55;
}

.pv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
}

.pv-tile {
  height: 14px;
  border-radius: 0.2rem;
  background: hsl(var(--card-bg));
  border: 1px solid hsl(var(--border-subtle));
}

.pv-tile-lg {
  background: hsl(var(--primary));
  border-color: transparent;
}

.pv-tile-accent {
  background: hsl(var(--accent));
  border-color: transparent;
}

.pv-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25rem;
  flex: 1;
}

.pv-card {
  border-radius: 0.2rem;
  background: hsl(var(--card-bg));
  border: 1px solid hsl(var(--border-subtle));
}

.pv-card-accent {
  border-color: hsl(var(--primary) / 0.55);
}

.preview-label {
  font-size: 0.7rem;
  line-height: 1;
  color: hsl(var(--text-secondary));
  white-space: nowrap;
}

/* 选中 / hover：缩放预览本身，不改变内部主题变量 */
.theme-preview:hover .preview-canvas {
  transform: scale(1.04);
}

.theme-preview.active .preview-canvas {
  box-shadow: 0 0 0 2px hsl(var(--primary));
}

.theme-preview.active .preview-label {
  color: hsl(var(--primary));
  font-weight: 600;
}
</style>
