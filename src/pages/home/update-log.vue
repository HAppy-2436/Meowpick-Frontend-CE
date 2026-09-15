<template>
  <view class="background" :class="themeStore.themeClass">
    <TopNavBar title="版本更新日志" />

    <view :style="{ height: navBarHeight + 'px' }"></view>

    <view class="log-list">
      <view class="timeline-container">
        <InformationBox :data="UpdateLog" />
      </view>
      <view class="bottom-spacer"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import InformationBox from '@/pages/home/InformationBox/index.vue';
import { UpdateLog } from './information';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

const goBack = () => uni.navigateBack();
</script>

<style lang="scss" scoped src="./update-log.scss" />