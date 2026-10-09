<template>
  <view>hello</view>
</template>

<script setup lang="ts">
import { navigateToPage } from "@/original/utils/navigation";

const goToSearch = () => {
  navigateToPage({
    url: "/original/pages/find/index/index"
  });
};
</script>

<style scoped lang="scss"></style>
