<script setup lang="ts">
defineProps<{ visible: boolean }>()
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-30 grid place-items-center bg-[hsl(var(--bg-page))]"
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="size-8 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
        <span class="text-xs text-fg-subtle">加载中…</span>
      </div>
    </div>
  </Transition>
</template>
