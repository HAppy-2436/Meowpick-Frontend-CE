<template>
  <view class="course-info-track" :class="themeStore.themeClass">
    <view v-if="hasTeacher" class="course-info-item">
      <MwpIcon name="user-round" size="30rpx" class="info-icon" />
      <view class="info-text">{{ teacherText }}</view>
    </view>
    <view class="course-info-item">
      <MwpIcon name="building-2" size="30rpx" class="info-icon" />
      <view class="info-text">{{ deptText }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';

const props = defineProps<{
  teachers?: string;
  department?: string;
}>();

const themeStore = useThemeStore();

const teacherText = computed(() => (props.teachers || '').trim());
const hasTeacher = computed(() => teacherText.value.length > 0);
const deptText = computed(() => (props.department || '').trim() || '暂无院系');
</script>

<style lang="scss" scoped src="./PublishInfoTrack.scss" />
