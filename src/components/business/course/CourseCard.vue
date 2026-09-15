<template>
  <div class="search-result-box"> <!-- Removed dynamic class binding to prevent double styles -->
    <!-- Proposal Card Style -->
    <template v-if="isProposal">
      <view class="proposal-card">
          <view class="proposal-content">
              <view class="proposal-row-top">
                  <text class="proposal-name">{{ props.data?.name }}</text>
              </view>
              
              <view class="proposal-row-middle">
                   <view class="proposal-info-item">
                        <image src="@/images/teacher-icon.png" class="info-icon" />
                        <text>{{ props.data?.teacherName || '未知教师' }}</text>
                   </view>
                   <view class="proposal-info-item">
                        <image src="@/images/depart-icon.png" class="info-icon" />
                        <text>{{ props.data?.department || '全校' }}</text>
                   </view>
              </view>

              <view class="proposal-row-bottom">
                  <text class="proposal-badge">提案新增</text>
                  <view class="vote-count-box" :class="{ 'is-liked': isLiked }" @click.stop="handleLike" hover-class="mwp-hover">
                      <image src="@/images/like_active.png" class="vote-icon" />
                      <text class="vote-num">{{ likeCount }}</text>
                      <text class="vote-label">支持</text>
                  </view>
              </view>
          </view>
      </view> 
    </template>

    <!-- Original Course Card Style -->
    <div class="search-result" v-else>
      <view class="course-content">
          <view class="course-row-top">
              <text class="course-name">{{ props.data?.name }}</text>
              <text class="course-category">{{ props.data?.category }}</text>
          </view>
          
          <view class="course-row-middle">
               <view class="course-info-item" v-if="teacherDisplayList.length">
                    <image src="@/images/teacher-icon.png" class="info-icon" />
                    <text class="teacher-name-list">
                      {{ teacherDisplayList.join(' / ') }}
                    </text>
               </view>
               <view class="course-info-item">
                    <image src="@/images/depart-icon.png" class="info-icon" />
                    <text>{{ props.data?.department || '暂无院系' }}</text>
               </view>
          </view>

           <!-- Tags section - Simplified -->
          <view class="course-row-bottom" v-if="props.data?.tagCount && Object.keys(props.data.tagCount).length > 0">
            <view
              v-for="(item, idx) of getTop3List(props.data?.tagCount!)"
              :key="idx"
              class="tag-item"
            >
              <text class="emoji-text">{{ item.tag }}</text>
              <view class="tag-count">{{ item.count }}</view>
            </view>
          </view>
           <!-- Description fallback -->
          <view class="desc" v-if="props.data?.describe">
            {{ props.data.describe }}
          </view>
      </view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"; // Import computed
import type { CourseVO, TeacherVO } from "@/api/data-contracts";
import { getTop3List } from "@/utils/tags";
import { http } from "@/config";
import { teachersToStrings } from "@/utils/teacher-display";

// Extend type locally
type MixedResult = CourseVO & {
  resultType?: string;
  matchScore?: number;
  tagCount?: object;
  teacherList?: TeacherVO[];
  describe?: string;
  reason?: string;
  proposalReason?: string;
  teacherName?: string; // Add teacherName
  voteCount?: number; // Add voteCount
  agreeCount?: number;
  isLiked?: boolean;
  likeCnt?: number;
};

// Define props with default values or use defineProps directly
const props = defineProps<{ data: MixedResult }>();

const isProposal = computed(() => {
    return props.data?.resultType === 'proposal';
});

const teacherDisplayList = computed<string[]>(() => {
  if (props.data?.teacherList?.length) {
    return teachersToStrings(props.data.teacherList as Array<string | TeacherVO>);
  }
  if (Array.isArray(props.data?.teachers) && props.data!.teachers!.length) {
    return teachersToStrings(props.data!.teachers as Array<string | TeacherVO>);
  }
  return [];
});

const isLiked = ref(props.data?.isLiked || false);
const likeCount = ref(props.data?.likeCnt || props.data?.voteCount || props.data?.agreeCount || 0);

const handleLike = async () => {
    if (!props.data?.id) return;
    try {
        const res = await http.ActionController.likeCreate(props.data.id, { targetId: props.data.id, targetType: 'proposal' });
        const result = res.data?.data;
        if (result !== undefined) {
            if (result.like !== undefined) {
                isLiked.value = result.like;
            }
            if (result.likeCnt !== undefined) {
                likeCount.value = result.likeCnt;
            }
        }
    } catch (err) {
        console.error('[CourseCard] like error:', err);
    }
};
</script>

<style lang="scss" scoped src="@/components/choose/choose-course/style.scss" />
