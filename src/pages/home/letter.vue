<template>
  <view class="letter-container" :class="themeStore.themeClass">
    <TopNavBar title="致用户的一封信" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <view class="content-card">
      <view class="card-body">
        <text
          v-for="(line, i) in letterLines"
          :key="i"
          class="paragraph"
          :class="{ highlight: line.highlight }"
          >{{ line.text }}</text
        >
      </view>
      <view class="card-footer">
        <view class="footer-row">
          <text class="footer-text">感谢大家一直以来对选课猫的喜爱与支持</text>
          <MwpIcon name="heart" size="26rpx" class="footer-heart" />
        </view>
        <text class="signature">选课猫团队 2026年10月</text>
      </view>
    </view>
    <MwpStatusOverlay />
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
  { text: '同学们，大家好呀！', highlight: false },
  {
    text: '不管你刚刚认识选课猫，还是已经陪我们走过好几个选课季，都先收下这声问候~',
    highlight: false
  },
  {
    text: '选课猫是一个由学生社团维护的课程评价社区，希望让选课这件事轻松一点点。',
    highlight: true
  },
  { text: ' ', highlight: false },
  {
    text: '在这里，你可以搜索课程和老师，翻翻同学们留下的真实评价，选课之前心里先有个底。',
    highlight: false
  },
  {
    text: '上完一门课，也欢迎写下自己的体验，一条吐槽或许就能帮学弟学妹少踩一个坑。',
    highlight: false
  },
  {
    text: '如果搜来搜去都没有想找的课，还可以在提案广场发起提案，和大家一起投票，把它送进课程库。',
    highlight: false
  },
  { text: ' ', highlight: false },
  {
    text: '看评价、写吐槽、补课程——这些一直都在，未来我们也会继续添些新东西。',
    highlight: true
  },
  {
    text: '对了，这一次选课猫还换上了一套可选的新皮肤，也就是你现在正在体验的，欢迎提提意见~',
    highlight: false
  },
  {
    text: '有想法或问题，随时来官方反馈QQ群：344213052 找我们。',
    highlight: false
  }
];

onLoad(() => {
  uni.setStorageSync('hasReadLetter', true);
});
</script>

<style lang="scss" scoped src="./letter.scss" />
