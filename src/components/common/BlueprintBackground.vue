<script setup lang="ts">
/**
 * 工程蓝图背景 - 纯 CSS 网格纸 + 缓慢漂移的十字准线
 * 无 JS 计算、无 canvas，动画走 transform，尊重 prefers-reduced-motion
 */
</script>

<template>
  <div class="blueprint-bg" aria-hidden="true">
    <!-- 细网格 -->
    <div class="bp-grid bp-grid-fine" />
    <!-- 粗网格（每 5 格） -->
    <div class="bp-grid bp-grid-bold" />
    <!-- 漂移十字准线 -->
    <div class="bp-crosshair" />
    <!-- 四角定位标记 -->
    <div class="bp-corner bp-corner-tl" />
    <div class="bp-corner bp-corner-tr" />
    <div class="bp-corner bp-corner-bl" />
    <div class="bp-corner bp-corner-br" />
  </div>
</template>

<style scoped>
.blueprint-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  /* 纸面底：中心亮、边缘略深的氰版纸 */
  background:
    radial-gradient(ellipse at 50% 40%, hsl(206 52% 96%) 0%, hsl(208 44% 90%) 55%, hsl(209 40% 85%) 100%);
  /* 网格线颜色 */
  --bp-line: hsl(212 55% 52%);
}

.bp-grid {
  position: absolute;
  inset: -2px;
  background-repeat: repeat;
}

.bp-grid-fine {
  background-image:
    linear-gradient(to right, hsl(var(--bp-line) / 0.14) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--bp-line) / 0.14) 1px, transparent 1px);
  background-size: 20px 20px;
}

.bp-grid-bold {
  background-image:
    linear-gradient(to right, hsl(var(--bp-line) / 0.26) 1px, transparent 1px),
    linear-gradient(to bottom, hsl(var(--bp-line) / 0.26) 1px, transparent 1px);
  background-size: 100px 100px;
}

/* 十字准线：横竖长线缓慢扫过 */
.bp-crosshair::before,
.bp-crosshair::after {
  content: '';
  position: absolute;
  background: hsl(var(--bp-line) / 0.3);
}

.bp-crosshair::before {
  left: 0;
  right: 0;
  height: 1px;
  animation: bp-scan-v 26s linear infinite;
}

.bp-crosshair::after {
  top: 0;
  bottom: 0;
  width: 1px;
  animation: bp-scan-h 34s linear infinite;
}

@keyframes bp-scan-v {
  0% { top: 0%; }
  100% { top: 100%; }
}

@keyframes bp-scan-h {
  0% { left: 0%; }
  100% { left: 100%; }
}

/* 四角定位标记：图纸角标 */
.bp-corner {
  position: absolute;
  width: 26px;
  height: 26px;
  border-color: hsl(var(--bp-line) / 0.45);
  border-style: solid;
  border-width: 0;
}

.bp-corner-tl { top: 16px; left: 16px; border-top-width: 2px; border-left-width: 2px; }
.bp-corner-tr { top: 16px; right: 16px; border-top-width: 2px; border-right-width: 2px; }
.bp-corner-bl { bottom: 16px; left: 16px; border-bottom-width: 2px; border-left-width: 2px; }
.bp-corner-br { bottom: 16px; right: 16px; border-bottom-width: 2px; border-right-width: 2px; }

@media (prefers-reduced-motion: reduce) {
  .bp-crosshair::before,
  .bp-crosshair::after {
    animation: none;
  }
}
</style>
