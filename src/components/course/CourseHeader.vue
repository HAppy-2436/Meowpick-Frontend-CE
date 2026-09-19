<template>
  <view class="course-header-container" :class="themeStore.themeClass">
    <view class="header-card">
      <!-- 1. 课程名称 -->
      <view class="card-top">
        <view class="course-title">{{ data.name || '未知课程' }}</view>
      </view>

      <!-- 2. 基本信息 Grid -->
      <view class="info-grid" :class="{ 'is-expanded': expanded }">
        <!-- 类别 -->
        <view class="info-item">
          <view class="icon-wrapper bg-blue">
            <MwpIcon name="tag" size="40rpx" class="icon" />
          </view>
          <view class="info-content">
            <text class="label">课程类别</text>
            <text class="value">{{ data.category || '暂无分类' }}</text>
          </view>
        </view>

        <!-- 院系 -->
        <view class="info-item">
          <view class="icon-wrapper bg-green">
            <MwpIcon name="building-2" size="40rpx" class="icon" />
          </view>
          <view class="info-content">
            <text class="label">开课院系</text>
            <text class="value">{{ data.department || '暂无院系' }}</text>
          </view>
        </view>

        <!-- 教师 -->
        <view class="info-item">
          <view class="icon-wrapper bg-orange">
            <MwpIcon name="user-round" size="40rpx" class="icon" />
          </view>
          <view class="info-content">
            <text class="label">任课教师</text>
            <text v-if="!expanded" class="value">{{ teacherText }}</text>
            <view v-else class="value-list">
              <text
                v-for="(t, i) in teacherNames"
                :key="i"
                class="teacher-name"
                >{{ t }}</text
              >
              <text v-if="!teacherNames?.length">待定</text>
            </view>
          </view>
        </view>

        <!-- 校区 -->
        <view class="info-item">
          <view class="icon-wrapper bg-purple">
            <MwpIcon name="map-pin" size="40rpx" class="icon" />
          </view>
          <view class="info-content">
            <text class="label">开设校区</text>
            <text class="value">{{
              (data.campuses || []).join('、') || '暂无校区'
            }}</text>
          </view>
        </view>
      </view>

      <!-- 3. 标签/描述 (如果有) -->
      <view v-if="description" class="tags-section">
        <text class="desc-text">{{ description }}</text>
      </view>

      <!-- 4. 展开/收起（仅当基本信息被截断时出现） -->
      <view
        v-if="expanded || isOverflowing"
        class="expand-toggle mwp-pressable"
        hover-class="mwp-hover"
        @click="toggleExpand"
      >
        <text class="toggle-text">{{ expanded ? '收起' : '展开' }}</text>
        <view class="toggle-chevron" :class="{ 'is-expanded': expanded }" />
      </view>
    </view>

    <!-- 离屏测量层：用自然宽度判断四个信息项是否被截断，不参与布局 -->
    <text class="measure-text">{{ data.category || '暂无分类' }}</text>
    <text class="measure-text">{{ data.department || '暂无院系' }}</text>
    <text class="measure-text">{{ teacherText }}</text>
    <text class="measure-text">{{ campusText }}</text>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';
import { teachersToStrings } from '@/utils/teacher-display';
import type { DtoCourseVO, DtoTeacherVO } from '@/api/data-contracts';

const themeStore = useThemeStore();

type Props = {
  data: DtoCourseVO;
  teachers?: string[];
};
const props = defineProps<Props>();

// 教师名称列表：优先使用父级归一化后的字符串数组，兼容字符串/对象两种返回
const teacherNames = computed(() => {
  if (props.teachers?.length) return props.teachers;
  if (!props.data) return [];
  return teachersToStrings(props.data.teachers as Array<string | DtoTeacherVO>);
});

// 描述字段未在 DtoCourseVO 中声明，后端可能返回，做兼容读取
const description = computed(() => {
  const extra = props.data as DtoCourseVO & { describe?: string };
  return extra?.describe || '';
});

const teacherText = computed(() => teacherNames.value.join('、') || '待定');
const campusText = computed(
  () => (props.data.campuses || []).join('、') || '暂无校区'
);

const expanded = ref(false);
const isOverflowing = ref(false);
const toggleExpand = () => {
  expanded.value = !expanded.value;
};

// 折叠态下对比「离屏自然宽度」与「单元格宽度」，判断四个信息项是否被截断
const instance = getCurrentInstance();
let measureTimer: ReturnType<typeof setTimeout> | null = null;

type RectNode = { width?: number } | null;

const runMeasure = () => {
  const proxy = instance?.proxy;
  if (!proxy) return;
  const query = uni.createSelectorQuery().in(proxy);
  query.select('.info-grid .info-content').boundingClientRect();
  query.selectAll('.measure-text').boundingClientRect();
  query.exec((res) => {
    const result = (res || []) as unknown[];
    const cell = result[0] as RectNode;
    const texts = (result[1] || []) as RectNode[];
    if (!cell?.width || !texts.length) return;
    isOverflowing.value = texts.some(
      (t) => !!t && (t.width || 0) > (cell.width || 0) + 1
    );
  });
};

const measure = () => {
  if (expanded.value) return;
  nextTick(() => {
    if (measureTimer) clearTimeout(measureTimer);
    measureTimer = setTimeout(runMeasure, 100);
  });
};

watch([() => props.data, () => props.teachers], measure, { immediate: true });
watch(expanded, (val) => {
  if (!val) measure();
});
onMounted(measure);
onUnmounted(() => {
  if (measureTimer) clearTimeout(measureTimer);
});
</script>

<style lang="scss" scoped src="./CourseHeader.scss" />
