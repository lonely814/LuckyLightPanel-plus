<script setup lang="ts">
// 冰川极光背景 - 冰蓝底 + 流动极光绸带 + 冰霜暗角 + 飘雪
// 仅用于 arctic-aurora 主题
</script>

<template>
  <div class="aurora-bg">
    <!-- 冰蓝底色 -->
    <div class="ab-base" />

    <!-- 极光绸带 -->
    <div class="ab-ribbon ribbon-1" />
    <div class="ab-ribbon ribbon-2" />
    <div class="ab-ribbon ribbon-3" />

    <!-- 冰晶六边形网格 -->
    <div class="ab-crystal" />

    <!-- 飘雪 -->
    <div class="ab-snow s-1" />
    <div class="ab-snow s-2" />
    <div class="ab-snow s-3" />

    <!-- 冰霜暗角 -->
    <div class="ab-vignette" />

    <!-- 颗粒噪点 -->
    <div class="ab-grain" />
  </div>
</template>

<style scoped>
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
  background: hsl(var(--aa-ice-base));
}

.ab-base {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% -10%, hsl(var(--aa-ice-glow) / 0.55) 0%, transparent 55%),
    radial-gradient(ellipse at 90% 90%, hsl(var(--aa-aurora-green) / 0.05) 0%, transparent 45%);
}

/* 极光绸带 - 半透明横向渐变流 */
.ab-ribbon {
  position: absolute;
  left: -10%;
  right: -10%;
  height: 38vh;
  border-radius: 50%;
  pointer-events: none;
  will-change: transform;
}

.ribbon-1 {
  top: -6vh;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--aa-aurora-green) / 0.28) 28%,
    hsl(var(--aa-aurora-cyan) / 0.38) 50%,
    hsl(var(--aa-aurora-purple) / 0.22) 74%,
    transparent 100%
  );
  filter: blur(36px);
  animation: aa-drift-1 24s ease-in-out infinite alternate;
}

.ribbon-2 {
  top: 26vh;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--aa-aurora-purple) / 0.18) 30%,
    hsl(var(--aa-aurora-green) / 0.26) 55%,
    transparent 100%
  );
  filter: blur(44px);
  animation: aa-drift-2 30s ease-in-out infinite alternate;
}

.ribbon-3 {
  top: 62vh;
  background: linear-gradient(
    90deg,
    hsl(var(--aa-aurora-cyan) / 0.14) 0%,
    hsl(var(--aa-aurora-green) / 0.2) 40%,
    hsl(var(--aa-aurora-cyan) / 0.16) 70%,
    transparent 100%
  );
  filter: blur(40px);
  animation: aa-drift-3 27s ease-in-out infinite alternate;
}

@keyframes aa-drift-1 {
  from { transform: translate(-4vw, 0) scale(1); }
  to { transform: translate(5vw, 3vh) scale(1.12); }
}

@keyframes aa-drift-2 {
  from { transform: translate(4vw, 1vh) scale(1.05); }
  to { transform: translate(-5vw, -2vh) scale(0.94); }
}

@keyframes aa-drift-3 {
  from { transform: translate(0, 0) scale(0.96); }
  to { transform: translate(3vw, 2vh) scale(1.08); }
}

/* 冰晶六边形网格 - 极淡雪花骨架 */
.ab-crystal {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.05;
  background-image: radial-gradient(
    circle at 50% 50%,
    hsl(var(--aa-ice-ink)) 0 0.5px,
    transparent 0.5px 16px
  );
  background-size: 32px 28px;
}

/* 飘雪 - 慢速下落小点 */
.ab-snow {
  position: absolute;
  top: -4vh;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  pointer-events: none;
  background: hsl(var(--aa-ice-ink) / 0.35);
  filter: blur(0.5px);
}

.s-1 {
  left: 12%;
  animation: aa-snowfall 22s linear infinite;
}

.s-2 {
  left: 55%;
  width: 3px;
  height: 3px;
  animation: aa-snowfall 31s linear infinite 4s;
}

.s-3 {
  left: 82%;
  animation: aa-snowfall 26s linear infinite 9s;
}

@keyframes aa-snowfall {
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(calc(100vh + 6vh)) translateX(4vw); }
}

/* 冰霜暗角 */
.ab-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    transparent 60%,
    hsl(var(--aa-ice-base) / 0.5) 100%
  );
}

/* 颗粒噪点 */
.ab-grain {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ab-ribbon,
  .ab-snow {
    animation: none;
  }
}
</style>
