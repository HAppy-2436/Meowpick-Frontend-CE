<template>
  <view class="letter-container" :class="themeStore.themeClass">
    <TopNavBar title="致用户的一封信" @back="goBack" />

    <view :style="{ height: navBarHeight + 'px' }"></view>

    <view class="content-card">
      <view class="card-body">
        <text v-for="(line, i) in letterLines"
          :key="i"
          class="paragraph"
          :class="{ highlight: line.highlight }"
        >{{ line.text }}</text>
      </view>
      <view class="card-footer">
        <text class="footer-text">感谢大家一直以来对选课猫的喜爱与支持 ❤</text>
        <text class="signature">选课猫团队 2025年10月13日</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

const letterLines = [
  { text: '全新版的 选课猫 终于和大家见面啦！', highlight: false },
  { text: '原开发团队的朋友们大多已经毕业或升学，因此选课猫曾有一段时间陷入无人维护的状态。', highlight: false },
  { text: '在 2025 年暑假，我们新团队正式接过选课猫的维护与重构任务。', highlight: true },
  { text: ' ', highlight: false },
  { text: '也许大家暂时不会觉得新版有太多变化，这是因为我们暂未增加新功能。', highlight: false },
  { text: '但事实上，我们已经彻底重构了选课猫的整体后端架构，让系统更加稳定流畅。', highlight: true },
  { text: '今后在选课高峰期，也不再那么容易出现崩溃的情况啦！', highlight: false },
  { text: ' ', highlight: false },
  { text: '未来，我们还计划逐步推出更多功能，', highlight: false },
  { text: '包括大家期待已久的「新增课程和老师」功能等。', highlight: false },
];

const goBack = () => uni.navigateBack();

onLoad(() => {
  uni.setStorageSync('hasReadLetter', true);
});
</script>

<style lang="scss" scoped src="./letter.scss" />