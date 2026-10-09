<template>
  <view class="detail-page" :class="themeStore.themeClass">
    <TopNavBar title="课程详情" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <MwpScrollView
      v-model:refreshing="refreshing"
      class="content-scroll"
      @refresh="onRefresh"
      @scrolltolower="handleBottom"
    >
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

          <CourseCommentList
            :id="id"
            ref="commentListRef"
            @deleted="onCommentDeleted"
          />
        </view>
      </view>
    </MwpScrollView>

    <view
      class="fab-btn mwp-pressable"
      hover-class="mwp-hover"
      :hover-start-time="0"
      :hover-stay-time="0"
      @click="jump2comment"
    >
      <MwpIcon name="message-square" size="52rpx" class="fab-icon" />
    </view>
    <MwpStatusOverlay />
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

const commentListRef = ref<{ refresh?: () => Promise<void> | void } | null>(
  null
);
const refreshing = ref(false);
const onRefresh = async () => {
  try {
    await Promise.all([
      fetch(course_id),
      Promise.resolve(commentListRef.value?.refresh?.())
    ]);
  } finally {
    refreshing.value = false;
  }
};

onLoad((options: Record<string, string> = {}) => {
  course_id = options.id;
});
onShow(() => {
  fetch(course_id);
});

const handleBottom = () => {
  PubSub.publish('comment-next');
};

// 撤回/删除评论后同步顶部评价总数
const onCommentDeleted = () => {
  const data = course.value.data;
  if (data && typeof data.commentCount === 'number' && data.commentCount > 0) {
    data.commentCount -= 1;
  }
};

const jump2comment = () => {
  uni.navigateTo({ url: `/pages/course/comment?id=${id.value}` });
};
</script>

<style lang="scss" scoped src="./detail.scss" />
