<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ArrowUp } from 'lucide-vue-next'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 300
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200"
    leave-active-class="transition duration-200"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <button
      v-if="visible"
      type="button"
      class="glass fixed right-4 bottom-4 z-30 grid size-9 place-items-center text-fg-muted hover:text-fg"
      aria-label="返回顶部"
      @click="toTop"
    >
      <ArrowUp class="size-4" />
    </button>
  </Transition>
</template>
