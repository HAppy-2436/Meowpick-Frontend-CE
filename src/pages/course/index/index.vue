<template>
  <layout class="background" :class="themeStore.themeClass" @on-bottom="handleBottom()">

    <TopNavBar :title="course.data?.name || '课程详情'" />

    <view :style="{ height: navBarHeight + 'px' }"></view>

    <view class="content-wrapper">
      <course-header
        :data="course.data || {}"
        :teachers="teachers"
      />

      <view class="comment-section">
        <view class="section-header">
          <image src="@/images/comment-icon.png" class="header-icon" mode="aspectFit" />
          <text class="section-title">课程评价</text>
          <text v-if="course.data?.commentCount" class="section-subtitle">
            ({{ course.data.commentCount }})
          </text>
        </view>

        <CommentList :id="id" class="comment-list-container" />
      </view>
    </view>

    <view class="fab-btn mwp-pressable" @click="jump2comment">
      <image
        class="fab-icon"
        src="@/images/comment_white.png"
        mode="aspectFit"
      />
    </view>

  </layout>
</template>

<script setup lang="ts">
import { onShow, onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { useCourse } from './index';
import CommentList from '@/pages/course/index/CommentList.vue';
import CourseHeader from '@/components/course/course-header/index.vue';
import { useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

let course_id = '';
const { fetch, id, course, teachers } = useCourse();

onLoad((options: any) => {
  course_id = options.id;
});
onShow(() => {
  fetch(course_id);
});

const handleBottom = () => {
  PubSub.publish('comment-next');
};

const jump2comment = () => {
  uni.navigateTo({ url: `/pages/course/comment/index?id=${id.value}` });
};

const goBack = () => uni.navigateBack({ delta: 1 });
</script>

<style lang="scss" scoped src="./_style.scss" />