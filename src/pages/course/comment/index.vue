<template>
  <view class="comment-publish-container" :class="themeStore.themeClass">

    <TopNavBar title="发表吐槽" />

    <view :style="{ height: navBarHeight + 'px' }"></view>

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
          placeholder-class="mwp-placeholder"
          placeholder="请输入您的吐槽内容 (200字以内)..."
          maxlength="200"
          :disabled="isClicked"
        />
        <text class="word-count">{{ text.length }}/200</text>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-btn mwp-pressable" :class="{ 'is-disabled': isClicked || !canSubmit }" @click="commit">
      <text class="publish-btn__label">{{ isClicked ? '发布中...' : '发布吐槽' }}</text>
    </view>

    <view class="safe-area-bottom"></view>

    <!-- 加载蒙层 -->
    <view v-if="isClicked" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">发布中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import { TOAST_DURATION_MS } from '@/utils/constants';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

interface Tags {
  text: string;
  icon: string;
  isSelected: boolean;
}

const course_id = ref('');
const text = ref('');
const TotalTags = ref<Tags[]>([]);
const SelectedTags = ref<Tags[]>([]);
const isClicked = ref(false);

const canSubmit = computed(() =>
  text.value.trim().length > 0 || SelectedTags.value.length > 0
);

const InitTags = async () => {
  try {
    const res: any = await http.CommentController.tagsAllList();
    const list = (res?.data?.data ?? res?.data ?? []) as any[];
    TotalTags.value = list.map((t: any) => ({
      text: t.text,
      icon: t.icon,
      isSelected: false,
    }));
  } catch (e) {
    console.warn('[comment] tagsAllList failed:', e);
  }
};

const goBack = () => uni.navigateBack();

const toggleTag = (tag: Tags) => {
  if (isClicked.value) return;
  if (tag.isSelected) {
    tag.isSelected = false;
    SelectedTags.value = SelectedTags.value.filter((t) => t.text !== tag.text);
  } else {
    if (SelectedTags.value.length >= 4) {
      return uni.showToast({ title: '最多选择4个标签', icon: 'none' });
    }
    tag.isSelected = true;
    SelectedTags.value.push(tag);
  }
};

const commit = async () => {
  if (isClicked.value) return;
  if (!canSubmit.value) {
    return uni.showToast({ title: '请选择标签或填写内容', icon: 'none' });
  }

  isClicked.value = true;
  try {
    const tagTexts = SelectedTags.value.map((t) => t.text);
    await http.CommentController.commentAddCreate({
      courseId: course_id.value,
      content: text.value,
      tags: tagTexts,
    });

    uni.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => uni.navigateBack(), TOAST_DURATION_MS);
  } catch (e) {
    console.error('[course/comment] publish error:', e);
    uni.showToast({ title: '发布失败', icon: 'none' });
    isClicked.value = false;
  }
};

onLoad((options: any) => {
  course_id.value = options.id || '';
});

onMounted(() => {
  InitTags();
});
</script>

<style lang="scss" scoped src="./_style.scss" />