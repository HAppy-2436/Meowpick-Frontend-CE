<script setup lang="ts">
const emit = defineEmits<{
  (event: "bottom"): void;
}>();

function bottom() {
  emit("bottom");
}
</script>
<template>
  <scroll-view scroll-y :lower-threshold="80" style="height: 100%" @scrolltolower="bottom">
    <slot />
  </scroll-view>
</template>

<style scoped lang="scss" src="./style.scss" />
