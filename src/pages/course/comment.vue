<template>
  <view class="comment-publish-container" :class="themeStore.themeClass">
    <TopNavBar title="发表吐槽" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <!-- 标签选择 -->
    <view class="section-card" :class="{ 'is-disabled': isClicked }">
      <view class="section-header">
        <text class="section-title">选择标签</text>
        <text class="section-subtitle">最多选4个</text>
      </view>
      <view class="tags-grid">
        <view
          v-for="(item, index) in TotalTags"
          :key="index"
          class="tag-item mwp-pressable"
          :class="{ 'is-active': item.isSelected }"
          :style="{ animationDelay: `${Math.min(index * 60, 240)}ms` }"
          hover-class="mwp-hover"
          :hover-start-time="0"
          :hover-stay-time="0"
          @click="toggleTag(item)"
        >
          <image :src="item.icon" class="tag-icon" mode="aspectFit" />
          <text class="tag-text">{{ item.text }}</text>
        </view>
      </view>
    </view>

    <!-- 吐槽输入 -->
    <view class="section-card" :class="{ 'is-disabled': isClicked }">
      <view class="section-header">
        <text class="section-title">吐槽内容</text>
      </view>
      <view class="input-box">
        <textarea
          v-model="text"
          class="comment-input"
          placeholder-class="mwp-placeholder--area"
          placeholder="请输入您的吐槽内容 (140字以内)..."
          :maxlength="140"
          :disabled="isClicked"
        />
        <text class="word-count">{{ text.length }}/140 字</text>
      </view>
    </view>

    <!-- 发布按钮 -->
    <MwpButton
      class="publish-btn"
      tone="brand"
      size="lg"
      block
      :loading="isLoading"
      :disabled="isClicked || !canSubmit"
      @click="commit"
    >
      {{ isLoading ? '发布中...' : '发布吐槽' }}
    </MwpButton>

    <view class="safe-area-bottom" />

    <!-- 全局状态弹窗宿主 -->
    <MwpStatusOverlay />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { http, useThemeStore, PubSub } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import {
  showLoading,
  hideLoading,
  showSuccess,
  showError,
  showInfo
} from '@/composables/useStatus';
import { TOAST_DURATION_MS } from '@/utils/constants';
import { errorMessageOf } from '@/utils/review-error';
import { TotalTags, InitTags, type Tags } from '@/utils/tags';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

const course_id = ref('');
const text = ref('');
const SelectedTags = ref<Tags[]>([]);
const isClicked = ref(false);
const isLoading = ref(false);

const canSubmit = computed(() => text.value.trim().length > 0);

const toggleTag = (tag: Tags) => {
  if (isClicked.value) return;
  if (tag.isSelected) {
    tag.isSelected = false;
    SelectedTags.value = SelectedTags.value.filter((t) => t.text !== tag.text);
  } else {
    if (SelectedTags.value.length >= 4) {
      showInfo('最多选择4个标签');
      return;
    }
    tag.isSelected = true;
    SelectedTags.value.push(tag);
  }
};

const commit = async () => {
  if (isClicked.value) return;
  if (!canSubmit.value) {
    showInfo('请填写吐槽内容');
    return;
  }

  isClicked.value = true;
  isLoading.value = true;
  showLoading('发布中...');
  try {
    const tagTexts = SelectedTags.value.map((t) => t.text);
    const res = await http.CommentController.commentAddCreate({
      courseId: course_id.value,
      content: text.value,
      tags: tagTexts
    });
    const code = res.data?.code;
    if (!(code === 200 || code === 0 || code === 201)) {
      hideLoading();
      showError(errorMessageOf(code, res.data?.msg) || '发布失败，请重试');
      isClicked.value = false;
      isLoading.value = false;
      return;
    }

    hideLoading();
    isLoading.value = false;
    PubSub.publish('comment-refresh', course_id.value);
    showSuccess('发布成功');
    setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
  } catch (e) {
    console.error('[course/comment] publish error:', e);
    hideLoading();
    showError('发布失败');
    isClicked.value = false;
    isLoading.value = false;
  }
};

onLoad((options: Record<string, string> = {}) => {
  if (options.id) {
    course_id.value = options.id;
  }
  if (options.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data));
      if (data?.id) course_id.value = data.id;
    } catch (e) {
      console.error('[course/comment] parse data error:', e);
    }
  }
});

onMounted(() => {
  InitTags();
});
</script>

<style lang="scss" scoped src="./comment.scss" />
