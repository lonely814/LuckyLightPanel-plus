<script setup lang="ts">
// 光牌点阵背景 - 整页灯板：未点亮灯珠点阵 + 琥珀漫射 + 缓慢扫描亮带
// 仅用于 light-panel 主题
</script>

<template>
  <div class="lp-background">
    <div class="lp-board" />

    <!-- 未点亮灯珠点阵 -->
    <div class="lp-dots" />

    <!-- 琥珀环境光 -->
    <div class="lp-ambient lp-ambient-1" />
    <div class="lp-ambient lp-ambient-2" />

    <!-- 缓慢扫描亮带 -->
    <div class="lp-scanband" />

    <!-- 暗角 -->
    <div class="lp-vignette" />
  </div>
</template>

<style scoped>
.lp-background {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--bg-page));
}

/* 灯板底色 */
.lp-board {
  position: absolute;
  inset: 0;
  background: hsl(var(--bg-page));
}

/* 未点亮灯珠点阵 - 灯板物理颗粒感 */
.lp-dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle at 2px 2px, hsl(0 0% 100% / 0.06) 1px, transparent 1.7px);
  background-size: 14px 14px;
}

/* 琥珀环境光 */
.lp-ambient {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  will-change: transform;
}

.lp-ambient-1 {
  width: 46vw;
  height: 46vw;
  left: -14vw;
  top: -16vw;
  background: radial-gradient(circle, hsl(var(--lp-amber) / 0.1) 0%, transparent 65%);
  animation: lp-drift-1 30s ease-in-out infinite alternate;
}

.lp-ambient-2 {
  width: 40vw;
  height: 40vw;
  right: -12vw;
  bottom: -12vw;
  background: radial-gradient(circle, hsl(var(--lp-amber) / 0.07) 0%, transparent 65%);
  animation: lp-drift-2 36s ease-in-out infinite alternate;
}

/* 缓慢扫描亮带 - 像灯牌刚通电的刷新带 */
.lp-scanband {
  position: absolute;
  left: 0;
  right: 0;
  height: 26vh;
  top: -26vh;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent,
    hsl(var(--lp-amber) / 0.03) 45%,
    hsl(var(--lp-amber) / 0.06) 50%,
    hsl(var(--lp-amber) / 0.03) 55%,
    transparent
  );
  animation: lp-scan 14s linear infinite;
}

/* 暗角 - 灯板纵深 */
.lp-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 55%, hsl(210 18% 4% / 0.5) 100%);
}

@keyframes lp-drift-1 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(6vw, 5vh) scale(1.15); }
}

@keyframes lp-drift-2 {
  from { transform: translate(0, 0) scale(1.05); }
  to { transform: translate(-5vw, -4vh) scale(0.92); }
}

@keyframes lp-scan {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(100vh + 26vh)); }
}

@media (prefers-reduced-motion: reduce) {
  .lp-ambient,
  .lp-scanband {
    animation: none;
  }
}
</style>
