<script setup lang="ts">
const emits = defineEmits<{ (e: 'onBottom'): void }>();

function bottom() {
  emits('onBottom');
}
</script>
<template>
  <div
    class="root"
    :style="{
      height: 'calc(100vh - env(safe-area-inset-bottom))',
      maxHeight: 'calc(100vh - env(safe-area-inset-bottom))'
    }"
  >
    <InfiniteScroll @bottom="bottom">
      <slot />
    </InfiniteScroll>
  </div>
</template>
<style scoped lang="scss" src="./Layout.scss" />
