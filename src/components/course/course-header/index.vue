<template>
  <view class="course-header-container" :class="themeStore.themeClass">
    <view class="header-card">
      
      <!-- 1. 课程名称 -->
      <view class="card-top">
        <view class="course-title">{{ data.name || '未知课程' }}</view>
      </view>

      <!-- 2. 基本信息 Grid -->
      <view class="info-grid">
        
        <!-- 类别 -->
        <view class="info-item">
           <view class="icon-wrapper bg-blue">
             <image src="@/images/category-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">课程类别</text>
             <text class="value">{{ data.category || '暂无分类' }}</text>
           </view>
        </view>

        <!-- 院系 -->
        <view class="info-item">
           <view class="icon-wrapper bg-green">
             <image src="@/images/depart-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">开课院系</text>
             <text class="value">{{ data.department || '暂无院系' }}</text>
           </view>
        </view>

        <!-- 教师 -->
        <view class="info-item">
           <view class="icon-wrapper bg-orange">
             <image src="@/images/teacher-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">任课教师</text>
             <view class="value-list">
                <text v-for="(t, i) in teacherNames" :key="i" class="teacher-name">{{ t }}</text>
                <text v-if="!teacherNames?.length">待定</text>
             </view>
           </view>
        </view>

        <!-- 校区 -->
        <view class="info-item">
           <view class="icon-wrapper bg-purple">
             <image src="@/images/campus-icon.png" class="icon" mode="aspectFit" />
           </view>
           <view class="info-content">
             <text class="label">开设校区</text>
             <text class="value">{{ (data.campuses || []).join('、') || '暂无校区' }}</text>
           </view>
        </view>

      </view>
      
      <!-- 3. 标签/描述 (如果有) -->
      <view class="tags-section" v-if="description">
          <text class="desc-text">{{ description }}</text>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from "@/config";
import { teachersToStrings } from "@/utils/teacher-display";
import type { DtoCourseVO, DtoTeacherVO } from "@/api/data-contracts";

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
</script>


<style lang="scss" scoped src="./_style.scss" />
