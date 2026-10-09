<template>
  <view class="timeline-container" :class="themeStore.themeClass">
    <view
      v-for="(item, index) in data"
      :key="index"
      class="timeline-item mwp-stagger-item"
      :style="{ animationDelay: `${Math.min(index * 60, 300)}ms` }"
    >
      <!-- 时间线轴 -->
      <view class="timeline-column">
        <view class="dot" />
        <view v-if="index !== data.length - 1" class="line" />
        <view v-else class="line line--last" />
      </view>

      <!-- 内容卡 -->
      <view class="content-card">
        <view class="header-row">
          <text class="version-title">{{ item[0] }}</text>
        </view>
        <view class="content-body">
          <view
            v-for="(line, lineIndex) in item.slice(1)"
            :key="lineIndex"
            class="content-row"
          >
            <view class="content-bullet" />
            <text class="content-text">{{ line }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

type Props = {
  data: string[][];
};

defineProps<Props>();
</script>

<style lang="scss" scoped src="./UpdateLogTimeline.scss" />
