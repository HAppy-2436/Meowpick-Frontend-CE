<script setup lang="ts">
const emit = defineEmits<{ (e: 'bottom'): void }>();

function bottom() {
  emit('bottom');
}
</script>
<template>
  <scroll-view scroll-y style="height: 100%" @scrolltolower="bottom">
    <slot />
  </scroll-view>
</template>
