<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const isVisible = ref(false)
const scrollProgress = ref(0)

function handleScroll() {
  isVisible.value = window.scrollY > 300
  
  // 计算滚动进度
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top-btn"
      @click="scrollToTop"
      title="返回顶部"
    >
      <!-- 背景 -->
      <div class="btn-bg" />
      
      <!-- 进度环 -->
      <svg class="progress-ring" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="rgba(var(--overlay-light-rgb),0.2)"
          stroke-width="2"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          :stroke-dasharray="`${scrollProgress * 1.256} 125.6`"
          class="progress-circle"
        />
      </svg>
      
      <!-- 图标 -->
      <div class="btn-icon">
        <ArrowUp class="icon" />
      </div>
      
      <!-- 光晕效果 -->
      <div class="btn-glow" />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 50;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(var(--overlay-light-rgb), 0.15);
  padding: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 
    0 4px 16px rgba(var(--overlay-dark-rgb), 0.15),
    0 0 0 1px rgba(var(--overlay-light-rgb), 0.05) inset;
  transition: all 200ms ease;
}

.back-to-top-btn:hover {
  border-color: rgba(var(--overlay-light-rgb), 0.25);
  box-shadow: 
    0 8px 24px rgba(var(--overlay-dark-rgb), 0.2),
    0 0 0 1px rgba(var(--overlay-light-rgb), 0.1) inset;
  transform: translateY(-2px);
}

.btn-bg {
  position: absolute;
  inset: 0;
  background: rgba(var(--overlay-dark-rgb), 0.4);
  transition: background 200ms;
}

.back-to-top-btn:hover .btn-bg {
  background: rgba(var(--overlay-dark-rgb), 0.55);
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-circle {
  transition: stroke-dasharray 200ms;
}

.btn-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
  transition: transform 200ms;
}

.back-to-top-btn:hover .icon {
  transform: translateY(-3px);
}

.btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--overlay-light-rgb), 0.15) 0%,
    rgba(var(--overlay-light-rgb), 0.05) 50%,
    rgba(var(--overlay-light-rgb), 0) 100%
  );
  opacity: 1;
  transition: opacity 200ms;
}

.back-to-top-btn:hover .btn-glow {
  opacity: 0.5;
}

/* 过渡动画 */
.back-to-top-enter-active {
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}

.back-to-top-leave-active {
  transition: all 300ms ease-in;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(2rem) scale(0.75);
}

.back-to-top-enter-to,
.back-to-top-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 响应式 */
@media (max-width: 640px) {
  .back-to-top-btn {
    bottom: 1rem;
    right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
  }
  
  .icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>
