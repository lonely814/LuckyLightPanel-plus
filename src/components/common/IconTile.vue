<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ src?: string | null; name: string }>(), { src: null })

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })

const showImage = computed(() => !!props.src && !failed.value)
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
</script>

<template>
  <div
    class="grid size-(--density-icon) shrink-0 place-items-center overflow-hidden rounded-[var(--radius-sm)] bg-line/40"
  >
    <img
      v-if="showImage"
      :src="props.src ?? ''"
      :alt="props.name"
      class="size-full object-contain"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="failed = true"
    />
    <span v-else class="text-fg-muted text-sm font-semibold">{{ initial }}</span>
  </div>
</template>
