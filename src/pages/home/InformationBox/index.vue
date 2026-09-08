<template>
  <view class="timeline-container" :class="themeStore.themeClass">
    <view
      v-for="(item, index) in data"
      :key="index"
      class="timeline-item mwp-stagger-item"
      :style="{ animationDelay: `${Math.min(index * 80, 320)}ms` }"
    >
      <!-- 时间线轴 -->
      <view class="timeline-column">
        <view class="dot"></view>
        <view v-if="index !== data.length - 1" class="line"></view>
        <view v-else class="line line--last"></view>
      </view>

      <!-- 内容卡 -->
      <view class="content-card">
        <view class="header-row">
          <text class="version-title">{{ item[0] }}</text>
        </view>
        <view class="content-body">
          <view v-for="(line, lineIndex) in item.slice(1)" :key="lineIndex" class="content-row">
            <text class="content-text">{{ line }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/config";

const themeStore = useThemeStore();

type Props = {
  data: string[][];
};

withDefaults(defineProps<Props>(), {});
</script>

<style lang="scss" scoped src="./_style.scss" />