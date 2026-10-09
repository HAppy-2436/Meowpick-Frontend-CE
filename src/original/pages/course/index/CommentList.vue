<template>
  <view class="comment">
    <view v-for="item of list" :key="item.id" class="item">
      <CommentBox :data="item" @like="like" />
    </view>
  </view>
</template>

<script setup lang="ts">
import PubSub from '@/original/config/utils/pubsub';
import { useCourseComment } from "@/original/pages/course/index/utils";
import CommentBox from "@/original/pages/course/index/CommentBox.vue";

const props = defineProps<{
  id: string;
  refreshKey?: number;
}>();
const { list, like, next, fetch, page } = useCourseComment(props);

watch(() => props.refreshKey, (current, previous) => {
  if (current === previous || !props.id) return;
  page.value = 1;
  fetch(props.id, 1);
});

const commentNextToken = PubSub.subscribe("comment-next", () => {
  next();
});

onUnmounted(() => {
  PubSub.unsubscribe(commentNextToken);
});
</script>

<style scoped lang="scss">
.comment {
  display: flex;
  flex-direction: column;
  .item {
    margin-top: auto;
  }
}
</style>
