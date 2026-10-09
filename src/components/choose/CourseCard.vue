<template>
  <view
    class="course-card"
    :class="[
      themeStore.themeClass,
      {
        'course-card--brand': tone === 'brand',
        'course-card--bordered': bordered,
        'is-info-box': infoBox
      }
    ]"
  >
    <view class="course-content">
      <view class="course-row-top">
        <text class="course-name">{{ name }}</text>
        <view class="course-top-right">
          <slot name="top-right" />
          <text v-if="category" class="course-category">{{ category }}</text>
        </view>
      </view>

      <view class="course-row-middle">
        <PublishInfoTrack :teachers="teachers" :department="department" />
      </view>

      <slot />

      <slot name="footer" />
    </view>
  </view>
</template>

<script setup lang="ts">
import PublishInfoTrack from '@/components/profile/PublishInfoTrack.vue';
import { useThemeStore } from '@/config';

withDefaults(
  defineProps<{
    name?: string;
    teachers?: string;
    department?: string;
    category?: string;
    /** 卡片基调：plain 普通白卡；brand 品牌渐变底（「我的」页提案卡） */
    tone?: 'plain' | 'brand';
    /** 教师 / 院系行是否带灰底圆角「内嵌条」 */
    infoBox?: boolean;
    /** 是否加灰色描边（用于与同色白底区分） */
    bordered?: boolean;
  }>(),
  { tone: 'plain', infoBox: false, bordered: false }
);

const themeStore = useThemeStore();
</script>

<style lang="scss" scoped src="./CourseCard.scss" />
