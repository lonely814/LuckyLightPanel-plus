<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores/config'

const configStore = useConfigStore()

// 背景样式
const backgroundStyle = computed(() => configStore.backgroundStyle)
</script>

<template>
  <div class="tech-background">
    <!-- 基础渐变/图片背景 -->
    <div class="bg-layer" :style="backgroundStyle" />
    <!-- 柔和动态光斑 -->
    <div class="bg-aurora aurora-1" />
    <div class="bg-aurora aurora-2" />
    <div class="bg-aurora aurora-3" />
    <!-- 细腻颗粒噪点 -->
    <div class="bg-grain" />
  </div>
</template>

<style scoped>
.tech-background {
  position: fixed;
  inset: 0;
  z-index: -10;
  overflow: hidden;
}

.bg-layer {
  position: absolute;
  inset: 0;
  transition: background 500ms ease;
}

/* 柔和动态光斑 - 极简玻璃氛围 */
.bg-aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  will-change: transform;
  pointer-events: none;
}

.aurora-1 {
  width: 46vw;
  height: 46vw;
  left: -12vw;
  top: -14vw;
  background: radial-gradient(circle, hsl(var(--neon-purple) / 0.42) 0%, transparent 65%);
  animation: aurora-drift-1 26s ease-in-out infinite alternate;
}

.aurora-2 {
  width: 40vw;
  height: 40vw;
  right: -10vw;
  top: 8vh;
  background: radial-gradient(circle, hsl(var(--neon-cyan) / 0.32) 0%, transparent 65%);
  animation: aurora-drift-2 32s ease-in-out infinite alternate;
}

.aurora-3 {
  width: 34vw;
  height: 34vw;
  left: 24vw;
  bottom: -16vw;
  background: radial-gradient(circle, hsl(var(--neon-pink) / 0.22) 0%, transparent 65%);
  animation: aurora-drift-3 38s ease-in-out infinite alternate;
}

@keyframes aurora-drift-1 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(7vw, 5vh) scale(1.18); }
}

@keyframes aurora-drift-2 {
  from { transform: translate(0, 0) scale(1.05); }
  to { transform: translate(-6vw, 8vh) scale(0.92); }
}

@keyframes aurora-drift-3 {
  from { transform: translate(0, 0) scale(0.95); }
  to { transform: translate(4vw, -6vh) scale(1.15); }
}

/* 细腻颗粒噪点 */
.bg-grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 亮色主题降低光斑浓度 */
[data-theme="light"] .bg-aurora {
  opacity: 0.32;
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .bg-aurora {
    animation: none;
  }
}
</style>
