<template>
  <view class="search-result-box" :class="themeStore.themeClass">
    <CourseCard
      :name="data?.name || ''"
      :teachers="teacherText"
      :department="data?.department"
      :category="data?.category"
    >
      <!-- 标签：精简为前三个 -->
      <view
        v-if="data?.tagCount && Object.keys(data.tagCount).length > 0"
        class="course-row-bottom"
      >
        <view
          v-for="(item, idx) of getTop3List(data?.tagCount!)"
          :key="idx"
          class="tag-item"
        >
          <image
            v-if="Emoji(item.tag)"
            :src="Emoji(item.tag)"
            class="emoji-icon"
            mode="aspectFit"
          />
          <image
            v-else
            src="@/images/cat.png"
            class="emoji-icon"
            mode="aspectFit"
          />
          <text class="emoji-text">{{ item.tag }}</text>
          <view class="tag-count">{{ item.count }}</view>
        </view>
      </view>

      <!-- 无标签时回退到描述 -->
      <view v-if="data?.describe" class="desc">
        {{ data.describe }}
      </view>
    </CourseCard>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CourseCard from '@/components/choose/CourseCard.vue';
import type { DtoCourseVO, DtoTeacherVO } from '@/api/data-contracts';
import { Emoji, getTop3List } from '@/utils/tags';
import { useThemeStore } from '@/config';
import { teachersToStrings } from '@/utils/teacher-display';
const themeStore = useThemeStore();

// Extend type locally
type MixedResult = DtoCourseVO & {
  resultType?: string;
  matchScore?: number;
  tagCount?: Record<string, number>;
  teacherList?: DtoTeacherVO[];
  describe?: string;
  reason?: string;
  proposalReason?: string;
  teacherName?: string; // Add teacherName
  voteCount?: number; // Add voteCount
  agreeCount?: number;
  isLiked?: boolean;
  likeCnt?: number;
};

const props = defineProps<{ data: MixedResult }>();

const teacherDisplayList = computed<string[]>(() => {
  if (props.data?.teacherList?.length) {
    return teachersToStrings(
      props.data.teacherList as Array<string | DtoTeacherVO>
    );
  }
  if (Array.isArray(props.data?.teachers) && props.data.teachers.length) {
    return teachersToStrings(
      props.data.teachers as Array<string | DtoTeacherVO>
    );
  }
  return [];
});

const teacherText = computed(() => teacherDisplayList.value.join(' / '));
</script>

<style lang="scss" scoped src="./ChooseCourse.scss" />
