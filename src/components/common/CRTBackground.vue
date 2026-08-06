<script setup lang="ts">
// CRT 复古终端背景 - 扫描线 + 滚动亮带 + 暗角 + 闪烁
// 仅用于 crt-terminal 主题
</script>

<template>
  <div class="crt-background">
    <div class="crt-base" />

    <!-- 扫描线 -->
    <div class="crt-scanlines" />

    <!-- 滚动亮带 -->
    <div class="crt-scanband" />

    <!-- 暗角 -->
    <div class="crt-vignette" />

    <!-- 闪烁层 -->
    <div class="crt-flicker" />

    <!-- 颗粒噪点 -->
    <div class="crt-grain" />
  </div>
</template>

<style scoped>
.crt-background {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--bg-page));
}

.crt-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 30%, hsl(var(--crt-green) / 0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, hsl(var(--crt-cyan) / 0.04) 0%, transparent 45%);
}

/* 横向扫描线 */
.crt-scanlines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    hsl(0 0% 0% / 0.14) 0 1px,
    transparent 1px 3px
  );
}

/* 从上往下滚动的亮带 */
.crt-scanband {
  position: absolute;
  left: 0;
  right: 0;
  height: 22vh;
  top: -22vh;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent,
    hsl(var(--crt-green) / 0.05) 45%,
    hsl(var(--crt-green) / 0.09) 50%,
    hsl(var(--crt-green) / 0.05) 55%,
    transparent
  );
  animation: crt-roll 9s linear infinite;
}

/* 暗角 - CRT 球面感 */
.crt-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 55%,
    hsl(120 30% 2% / 0.55) 100%
  );
}

/* 整体闪烁 */
.crt-flicker {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: hsl(var(--crt-green) / 0.02);
  animation: crt-flicker 4s linear infinite;
}

.crt-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes crt-roll {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(100vh + 22vh)); }
}

@keyframes crt-flicker {
  0%, 100% { opacity: 0.6; }
  3% { opacity: 0.45; }
  6% { opacity: 0.7; }
  9% { opacity: 0.5; }
  52% { opacity: 0.65; }
  55% { opacity: 0.42; }
  58% { opacity: 0.68; }
  62% { opacity: 0.55; }
}

@media (prefers-reduced-motion: reduce) {
  .crt-scanband,
  .crt-flicker {
    animation: none;
  }
}
</style>
