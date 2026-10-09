<template>
  <nut-popup v-model:visible="show" position="bottom" round>
    <course-comment-publish :id="id" @commit="onComment" />
  </nut-popup>
  <div class="index">
    <ul>
      <li v-for="item in list" :key="item.id">
        <comment-item :data="item" @like="like" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useCourseComment } from './index';
import PubSub from '@/original/config/utils/pubsub';
import CourseCommentPublish from '@/original/components/course/course-comment-publish/index.vue';
import CommentItem from '@/original/components/comment/comment-item/index.vue';
const props = defineProps<{
  id: string;
}>();

const { list, like, next, fetch, page } = useCourseComment(props);

const show = ref(false);

function onComment() {
  page.value = 1;
  list.value = {};
  fetch(props.id, page.value);
  show.value = false;
}

PubSub.subscribe("comment-next", () => {
  next();
});
PubSub.subscribe("comment-open", () => {
  show.value = true;
});
</script>

<style scoped lang="scss" src="./style.scss" />
