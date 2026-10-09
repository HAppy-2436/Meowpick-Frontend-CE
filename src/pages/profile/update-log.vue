<template>
  <view class="background" :class="themeStore.themeClass">
    <TopNavBar title="版本更新日志" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <view class="log-list">
      <view class="timeline-container">
        <UpdateLogTimeline :data="UpdateLog" />
      </view>
      <view class="bottom-spacer" />
    </view>
    <MwpStatusOverlay />
  </view>
</template>

<script setup lang="ts">
import UpdateLogTimeline from '@/components/profile/UpdateLogTimeline.vue';
import { UpdateLog } from '@/utils/update-log';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();
</script>

<style lang="scss" scoped src="./update-log.scss" />
