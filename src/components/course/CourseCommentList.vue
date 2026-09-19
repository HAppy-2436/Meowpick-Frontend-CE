<template>
  <view class="comment" :class="themeStore.themeClass">
    <view
      v-for="(item, key, index) of list"
      :key="key"
      class="item mwp-fade-up"
      :style="{ animationDelay: Math.min(index * 60, 300) + 'ms' }"
    >
      <CourseCommentBox :data="item" @like="like" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useCourseComment } from '@/composables/useCourseComment';
import CourseCommentBox from '@/components/course/CourseCommentBox.vue';
import { onUnmounted } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const props = defineProps<{
  id: string;
}>();
const { list, like, next, fetch, page, refresh } = useCourseComment(props);
const subToken = PubSub.subscribe('comment-next', () => {
  next();
});
const refreshToken = PubSub.subscribe(
  'comment-refresh',
  (courseId?: string) => {
    if (courseId && courseId !== props.id) return;
    refresh();
  }
);
onUnmounted(() => {
  PubSub.unsubscribe(subToken);
  PubSub.unsubscribe(refreshToken);
});
</script>

<style scoped lang="scss">
.comment {
  display: flex;
  flex-direction: column;
}
</style>
