<template>
  <view class="detail-page" :class="themeStore.themeClass">
    <TopNavBar :title="course.data?.name || '课程详情'" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <scroll-view scroll-y class="content-scroll" @scrolltolower="handleBottom">
      <view class="content-wrapper">
        <CourseHeader :data="course.data || {}" :teachers="teachers" />

        <view class="comment-section">
          <view class="section-header">
            <MwpIcon name="message-square" size="40rpx" class="header-icon" />
            <text class="section-title">课程评价</text>
            <text v-if="course.data?.commentCount" class="section-subtitle">
              ({{ course.data.commentCount }})
            </text>
          </view>

          <CourseCommentList :id="id" />
        </view>
      </view>
    </scroll-view>

    <view
      class="fab-btn mwp-pressable"
      hover-class="mwp-hover"
      @click="jump2comment"
    >
      <MwpIcon name="message-square" size="56rpx" class="fab-icon" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow, onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { useCourse } from '@/composables/useCourse';
import CourseCommentList from '@/components/course/CourseCommentList.vue';
import CourseHeader from '@/components/course/CourseHeader.vue';
import { useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

let course_id = '';
const { fetch, id, course, teachers } = useCourse();

onLoad((options: Record<string, string> = {}) => {
  course_id = options.id;
});
onShow(() => {
  fetch(course_id);
});

const handleBottom = () => {
  PubSub.publish('comment-next');
};

const jump2comment = () => {
  uni.navigateTo({ url: `/pages/course/comment?id=${id.value}` });
};

const goBack = () => uni.navigateBack({ delta: 1 });
</script>

<style lang="scss" scoped src="./detail.scss" />
