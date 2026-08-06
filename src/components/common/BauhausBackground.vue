<script setup lang="ts">
// 包豪斯几何背景 - 旋转圆环、半圆、斜纹、色块
// 仅用于 bauhaus 主题
</script>

<template>
  <div class="bauhaus-background">
    <div class="bh-base" />

    <!-- 旋转同心圆环 -->
    <div class="bh-rings">
      <div class="ring ring-1" />
      <div class="ring ring-2" />
      <div class="ring ring-3" />
    </div>

    <!-- 红蓝半圆 -->
    <div class="bh-half-circle" />

    <!-- 黄色色块 -->
    <div class="bh-block bh-block-yellow" />

    <!-- 对角红色长条 -->
    <div class="bh-diagonal" />

    <!-- 黑色圆点与方点 -->
    <div class="bh-dots">
      <span class="dot-black" />
      <span class="dot-blue" />
      <span class="dot-ring" />
    </div>

    <!-- 颗粒噪点 -->
    <div class="bh-grain" />
  </div>
</template>

<style scoped>
.bauhaus-background {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--bg-page));
}

.bh-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, hsl(var(--bauhaus-yellow) / 0.14) 0%, transparent 32%),
    radial-gradient(circle at 85% 75%, hsl(var(--bauhaus-blue) / 0.1) 0%, transparent 36%),
    radial-gradient(circle at 70% 15%, hsl(var(--bauhaus-red) / 0.08) 0%, transparent 30%);
}

/* 旋转同心圆环 - 包豪斯签名元素 */
.bh-rings {
  position: absolute;
  top: -14vw;
  right: -10vw;
  width: 44vw;
  height: 44vw;
  pointer-events: none;
}

.ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid hsl(var(--bauhaus-black) / 0.85);
}

.ring-2 {
  inset: 12%;
  border-color: hsl(var(--bauhaus-red) / 0.8);
  border-width: 10px;
  animation: bh-spin 42s linear infinite;
}

.ring-3 {
  inset: 30%;
  border-color: hsl(var(--bauhaus-blue) / 0.85);
  border-width: 6px;
  animation: bh-spin-reverse 60s linear infinite;
}

/* 红蓝半圆 */
.bh-half-circle {
  position: absolute;
  bottom: -12vw;
  left: -8vw;
  width: 32vw;
  height: 32vw;
  border-radius: 50%;
  background: linear-gradient(
    to right,
    hsl(var(--bauhaus-blue)) 0 50%,
    hsl(var(--bauhaus-red)) 50% 100%
  );
  border: 3px solid hsl(var(--bauhaus-black));
  opacity: 0.9;
  animation: bh-drift 30s ease-in-out infinite alternate;
}

/* 黄色色块 */
.bh-block-yellow {
  position: absolute;
  top: 22vh;
  left: -4vw;
  width: 12vw;
  height: 20vw;
  background: hsl(var(--bauhaus-yellow) / 0.85);
  border: 3px solid hsl(var(--bauhaus-black));
  transform: skewY(-14deg);
  animation: bh-slide 26s ease-in-out infinite alternate;
}

/* 对角红色长条 */
.bh-diagonal {
  position: absolute;
  bottom: 10vh;
  right: -6vw;
  width: 26vw;
  height: 5vw;
  background: repeating-linear-gradient(
    135deg,
    hsl(var(--bauhaus-red)) 0 3vw,
    hsl(var(--bauhaus-black)) 3vw 6vw
  );
  transform: rotate(-18deg);
  opacity: 0.9;
  animation: bh-slide-x 34s ease-in-out infinite alternate;
}

/* 装饰圆点 */
.bh-dots {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dot-black {
  position: absolute;
  top: 18vh;
  right: 24vw;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: hsl(var(--bauhaus-black));
  animation: bh-pulse 5s ease-in-out infinite;
}

.dot-blue {
  position: absolute;
  bottom: 20vh;
  right: 18vw;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: hsl(var(--bauhaus-blue) / 0.85);
  animation: bh-pulse 6s ease-in-out infinite 0.8s;
}

.dot-ring {
  position: absolute;
  top: 30vh;
  left: 22vw;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 6px solid hsl(var(--bauhaus-red) / 0.75);
  animation: bh-pulse 7s ease-in-out infinite 1.6s;
}

/* 颗粒噪点 */
.bh-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes bh-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bh-spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes bh-drift {
  from { transform: translate(0, 0) rotate(-3deg); }
  to { transform: translate(3vw, -2vh) rotate(3deg); }
}

@keyframes bh-slide {
  from { transform: translateY(0) skewY(-14deg); }
  to { transform: translateY(3vh) skewY(-10deg); }
}

@keyframes bh-slide-x {
  from { transform: translateX(0) rotate(-18deg); }
  to { transform: translateX(4vw) rotate(-14deg); }
}

@keyframes bh-pulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.18); opacity: 1; }
}

@media (max-width: 640px) {
  .bh-rings {
    top: -20vw;
    right: -22vw;
    width: 70vw;
    height: 70vw;
  }

  .bh-half-circle {
    width: 60vw;
    height: 60vw;
  }

  .bh-block-yellow,
  .bh-diagonal {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ring-2,
  .ring-3,
  .bh-half-circle,
  .bh-block-yellow,
  .bh-diagonal,
  .dot-black,
  .dot-blue,
  .dot-ring {
    animation: none;
  }
}
</style>
