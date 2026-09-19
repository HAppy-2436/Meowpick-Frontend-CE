<template>
  <view class="proposal-detail-page" :class="themeStore.themeClass">
    <TopNavBar title="新课提案详情" />

    <view :style="{ height: navBarHeight + 'px' }" />

    <scroll-view scroll-y class="content-scroll">
      <view class="proposal-card mwp-fade-up">
        <view class="card-header">
          <view class="proposal-badge">提案中</view>
          <text class="proposal-date">{{ proposalData.date || '刚刚' }}</text>
        </view>

        <text class="proposal-title">{{
          proposalData.name || '未命名提案'
        }}</text>

        <view class="proposal-info-row">
          <view class="info-item">
            <text class="info-label">提案教师</text>
            <text class="info-value">{{ proposalData.teacher || '待定' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">校区</text>
            <text class="info-value">{{ proposalData.campus || '全校' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">类型</text>
            <text class="info-value">{{
              proposalData.category || '通识课'
            }}</text>
          </view>
        </view>

        <view class="proposal-reason-box">
          <text class="reason-label">提案理由</text>
          <text class="reason-content">{{
            proposalData.reason || '该用户未填写详细理由。'
          }}</text>
        </view>

        <view class="vote-area">
          <view class="vote-info">
            <text class="vote-count-big">{{
              proposalData.voteCount || 0
            }}</text>
            <text class="vote-text">人支持此提案</text>
          </view>
          <view
            class="vote-btn mwp-pressable"
            :class="{ 'is-voted': isVoted }"
            hover-class="mwp-hover"
            @click="handleVote"
          >
            <text>{{ isVoted ? '已支持' : '🙋 支持提案' }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import TopNavBar from '@/components/common/TopNavBar.vue';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

interface PassedProposalData {
  id?: string;
  name?: string;
  teacher?: string;
  campus?: string;
  category?: string;
  reason?: string;
  date?: string;
  voteCount?: number;
  isVoted?: boolean;
  likeCnt?: number;
}

const proposalData = ref<PassedProposalData>({});
const isVoted = ref(false);

onLoad((options: Record<string, string> = {}) => {
  if (options.data) {
    try {
      proposalData.value = JSON.parse(decodeURIComponent(options.data));
      if (proposalData.value.isVoted) isVoted.value = true;
    } catch (e) {
      console.error('Failed to parse proposal data', e);
    }
  }
});

const goBack = () => uni.navigateBack();

const handleVote = async () => {
  if (isVoted.value || !proposalData.value.id) return;
  try {
    const res = await http.ActionController.likeCreate(proposalData.value.id, {
      targetId: proposalData.value.id,
      targetType: 'proposal'
    });
    const result = res.data?.data;
    if (result !== undefined) {
      if (result.like !== undefined) isVoted.value = result.like;
      if (result.likeCnt !== undefined) {
        proposalData.value.voteCount = result.likeCnt;
      }
      if (result.like) uni.showToast({ title: '支持成功', icon: 'success' });
    }
  } catch (err) {
    console.error('[proposal-detail] like error:', err);
    uni.showToast({ title: '支持失败', icon: 'none' });
  }
};
</script>

<style lang="scss" scoped src="./proposal-detail.scss" />
