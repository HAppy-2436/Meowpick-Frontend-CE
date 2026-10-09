<script setup lang="ts">
import { http } from '@/original/config';
import { getContentReviewError } from "@/original/utils/contentReview";

type Props = {
  id: string;
};
const props = defineProps<Props>();
const emit = defineEmits<{
  commit;
}>();

const text = ref("");
const publishing = ref(false);

async function commit() {
  if (publishing.value) return;
  const content = text.value.trim();
  if (!content) return;
  if (Array.from(content).length > 140) {
    uni.showToast({ title: "吐槽内容不能超过140个字符", icon: "none" });
    return;
  }

  publishing.value = true;
  try {
    const res = await http.CommentController.commentAddCreate({
      courseId: props.id,
      content
    });
    const errorMessage = getContentReviewError(res.data, 'comment', '吐槽发布失败，请稍后重试');
    if (errorMessage) {
      uni.showToast({ title: errorMessage, icon: 'none', duration: 3500 });
      return;
    }
    emit("commit");
  } catch (error) {
    console.error('[API] 发布吐槽失败:', error);
    uni.showToast({ title: '网络异常，已保留填写内容，请稍后重试', icon: 'none', duration: 3500 });
  } finally {
    publishing.value = false;
  }
}
</script>
<template>
  <div class="index">
    <div>
      <nut-textarea v-model="text" placeholder="短评一下" />
    </div>
    <div class="footer">
      <div />
      <div>
        <nut-button
          type="success"
          size="mini"
          color="#67C23A"
          :disabled="text.length == 0 || publishing"
          @click="commit"
          >发布</nut-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style.scss" />
