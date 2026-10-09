<script setup lang="ts">
import { useRouteStore } from '@/original/config';
import Scroll from "@/original/components/scroll/index.vue";

let bottomHeight = computed(() =>
  [
    "",
    "/original/pages/index/index/index",
    "/original/pages/group/index/index",
    "/original/pages/find/index/index",
    "/original/pages/message/index/index",
    "/original/pages/user/index/index"
  ].includes(useRouteStore().url.trim())
);
const props = defineProps({
  color: { type: String, default: "#fff" }
});
const emit = defineEmits<{
  (event: "onBottom"): void;
}>();

function bottom() {
  emit("onBottom");
}
</script>
<template>
  <div
    class="root"
    :style="{
      background: `${color}`,
      height: `calc(100vh - env(safe-area-inset-bottom) - ${
        bottomHeight ? 50 : 0
      }px)`,
      maxHeight: `calc(100vh - env(safe-area-inset-bottom) - ${
        bottomHeight ? 50 : 0
      }px)`
    }"
  >
    <Scroll @bottom="bottom">
      <slot />
    </Scroll>
  </div>
</template>
<style scoped lang="scss" src="./style.scss" />
