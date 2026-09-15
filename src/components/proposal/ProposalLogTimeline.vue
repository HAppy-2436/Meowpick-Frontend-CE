<template>
  <view class="timeline-list">
    <view v-if="loading && logs.length === 0" class="loading-state">
      <view class="spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <EmptyState v-else-if="error" tone="danger" emoji="⚠️" title="加载失败" compact>
      <template #action>
        <MwpButton tone="danger" @click="$emit('retry')">重试</MwpButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="logs.length === 0"
      emoji="📋"
      title="暂无操作记录"
      desc="管理员审批 / 撤回后会显示在这里"
    />

    <view v-else class="timeline">
      <view
        v-for="(log, idx) in logs"
        :key="log.logId || idx"
        class="timeline-item mwp-stagger-item"
        :style="{ animationDelay: `${Math.min(idx * 60, 360)}ms` }"
      >
        <view class="timeline-axis">
          <view class="timeline-dot" :class="`dot-${(log.actionType || '').toLowerCase()}`"></view>
          <view v-if="idx !== logs.length - 1" class="timeline-line"></view>
        </view>

        <view class="log-card mwp-pressable" @click="toggleCard(log.logId || '')" hover-class="mwp-hover">
          <view class="log-header">
            <view class="header-main">
              <text class="course-name">
                {{ log.proposalSnapshot?.courseName || log.proposalSnapshot?.title || '未知课程' }}
              </text>
              <text class="action-badge" :class="`badge-${(log.actionType || '').toLowerCase()}`">
                {{ actionTextOf(log.actionType) }}
              </text>
            </view>
            <view class="header-meta">
              <text class="operator">{{ log.operatorName || log.operatorId || '系统' }}</text>
              <text class="dot-sep">·</text>
              <text class="time">{{ formatTime(log.actionTime) }}</text>
            </view>
          </view>

          <view v-if="isExpanded(log.logId || '')" class="expand-area">
            <view v-if="log.proposalSnapshot?.department || log.proposalSnapshot?.category" class="snapshot-tags">
              <text v-if="log.proposalSnapshot?.department" class="snapshot-tag">
                {{ log.proposalSnapshot.department }}
              </text>
              <text v-if="log.proposalSnapshot?.category" class="snapshot-tag snapshot-tag--info">
                {{ log.proposalSnapshot.category }}
              </text>
            </view>

            <view v-if="log.details" class="details">
              <text class="details-label">操作详情：</text>
              <view class="details-content">
                <text v-if="log.details.reason" class="details-line">
                  <text class="details-key">拒绝原因：</text>
                  <text>{{ log.details.reason }}</text>
                </text>
                <text v-else-if="log.details.contribution" class="details-line">
                  <text class="details-key">贡献值变化：</text>
                  <text>{{ log.details.contribution }}</text>
                </text>
              </view>
            </view>

            <view class="proposal-link" @click.stop="$emit('proposal-click', log.proposalId)" hover-class="mwp-hover">
              <text>查看提案</text>
              <text class="link-arrow">›</text>
            </view>
          </view>

          <view class="chevron-wrap">
            <view class="chevron-icon" :class="{ expanded: isExpanded(log.logId || '') }">
              <text>⌄</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="noMore && logs.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DtoProposalTimelineLogVO } from '@/api/data-contracts';

const props = defineProps<{
  logs: DtoProposalTimelineLogVO[];
  loading?: boolean;
  error?: boolean;
  noMore?: boolean;
}>();

defineEmits<{
  retry: [];
  'proposal-click': [id?: string];
}>();

const expandedIds = ref<Set<string>>(new Set());

const isExpanded = (id: string) => expandedIds.value.has(id);

const toggleCard = (id: string) => {
  if (expandedIds.value.has(id)) expandedIds.value.delete(id);
  else expandedIds.value.add(id);
  expandedIds.value = new Set(expandedIds.value);
};

const ACTION_TEXT: Record<string, string> = {
  CREATE: '发起提案',
  APPROVE: '通过',
  REJECT: '拒绝',
  DELETE: '撤回',
  UPDATE: '更新',
  GRANT_ADMIN: '授权管理员',
  REVOKE_ADMIN: '撤销管理员',
};

const actionTextOf = (type?: string) => (type && ACTION_TEXT[type]) || type || '操作';

const formatTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
</script>

<style lang="scss" scoped>

.timeline-list {
  padding: $space-5 0;
}

.loading-state {
  padding: $space-12 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-4;
}

.spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(178, 0, 53, 0.20);
  border-top-color: $brand-red;
  border-radius: 50%;
  animation: mwp-spin $motion-spin linear infinite;
}

.loading-text {
  font-size: $font-base;
  color: $text-secondary-light;
  .dark-theme & {
    color: $text-secondary-dark;
  }
}






.timeline {
  position: relative;
  padding-left: $space-7;
}

.timeline-item {
  position: relative;
  margin-bottom: $space-7;
}

.timeline-axis {
  position: absolute;
  left: -$space-7;
  top: 0;
  bottom: 0;
  width: $space-7;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-top: $space-4;
  box-shadow: 0 0 0 4rpx rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  transition: transform $dur-base $ease-spring, box-shadow $dur-base $ease-standard;

  .timeline-item:active & {
    transform: scale(1.3);
  }

  .dark-theme & {
    box-shadow: 0 0 0 4rpx rgba(30, 30, 30, 0.6);
  }

  &.dot-create {
    background: $info;
    box-shadow: 0 0 0 4rpx rgba(0, 102, 204, 0.20);
  }
  &.dot-approve {
    background: $success;
    box-shadow: 0 0 0 4rpx rgba(56, 142, 60, 0.20);
  }
  &.dot-reject {
    background: $brand-red;
    box-shadow: 0 0 0 4rpx rgba(178, 0, 53, 0.20);
  }
  &.dot-delete {
    background: $warning;
    box-shadow: 0 0 0 4rpx rgba(230, 162, 60, 0.20);
  }
  &.dot-update {
    background: $info;
    box-shadow: 0 0 0 4rpx rgba(0, 102, 204, 0.20);
  }
}

.timeline-line {
  flex: 1;
  width: 2rpx;
  background: $divider-light;
  margin-top: $space-2;
  transition: background-color $dur-fast $ease-standard;

  .dark-theme & {
    background: $divider-dark;
  }
}

.log-card {
  background: $bg-card-light;
  border-radius: $radius-md;
  padding: $space-5 $space-6;
  box-shadow: $shadow-xs;
  border: 1rpx solid $divider-light;
  @include mwp-transition($dur-fast, $ease-standard);

  .dark-theme & {
    background: $bg-card-dark;
    border-color: $divider-dark;
    box-shadow: $shadow-xs-dark;
  }

  &:active {
    transform: scale($press-scale-sm);
  }
}

.log-header {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.header-main {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
}

.course-name {
  font-size: $font-base;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  flex: 1;
  min-width: 0;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.action-badge {
  font-size: $font-xs;
  font-weight: $weight-semibold;
  padding: 4rpx $space-3;
  border-radius: $radius-pill;
  flex-shrink: 0;

  &.badge-create {
    background: $info-soft;
    color: $info;
  }
  &.badge-approve {
    background: $success-soft;
    color: $success;
  }
  &.badge-reject {
    background: $danger-soft;
    color: $brand-red;
  }
  &.badge-delete {
    background: $warning-soft;
    color: $warning-text;
  }
  &.badge-update {
    background: $info-soft;
    color: $info;
  }

  .dark-theme & {
    &.badge-create,
    &.badge-update { color: $info-text-dark; }
    &.badge-approve { color: $success-text-dark; }
    &.badge-delete { color: $warning-text-dark; }
    &.badge-reject { color: $brand-red-soft; }
  }
}

.header-meta {
  display: flex;
  align-items: center;
  gap: $space-2;
  font-size: $font-xs;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.operator {
  font-weight: $weight-medium;
}

.dot-sep {
  opacity: 0.5;
}

.time {
  font-variant-numeric: tabular-nums;
}

.expand-area {
  margin-top: $space-5;
  padding-top: $space-5;
  @include dashed-divider;
  transition: border-color $dur-fast $ease-standard;
  animation: mwp-fade-up $motion-pop $ease-decelerate backwards;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

.snapshot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  margin-bottom: $space-4;
}

.snapshot-tag {
  font-size: $font-xs;
  color: $text-secondary-light;
  background: $bg-muted-light;
  padding: 4rpx $space-3;
  border-radius: $radius-pill;

  .dark-theme & {
    color: $text-secondary-dark;
    background: $bg-muted-dark;
  }

  &--info {
    color: $info;
    background: $info-soft;
  }
}

.details {
  margin-bottom: $space-4;
}

.details-label {
  font-size: $font-sm;
  font-weight: $weight-medium;
  color: $text-secondary-light;
  display: block;
  margin-bottom: $space-2;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.details-line {
  font-size: $font-sm;
  color: $text-primary-light;
  line-height: 1.6;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.details-key {
  font-weight: $weight-semibold;
  color: $brand-red;
  margin-right: $space-2;
}

.proposal-link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 $space-4;
  background: $danger-soft;
  border-radius: $radius-pill;
  font-size: $font-sm;
  color: $brand-red;
  font-weight: $weight-medium;
  @include mwp-transition($dur-fast, $ease-standard);

  &:active {
    transform: scale($press-scale-md);
  }
}

.link-arrow {
  font-size: $font-base;
  line-height: 1;
}

.chevron-wrap {
  display: flex;
  justify-content: center;
  margin-top: $space-3;
}

.chevron-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: $bg-muted-light;
  color: $text-tertiary-light;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-lg;
  line-height: 1;
  @include mwp-transition($dur-base, $ease-emphasized);

  .dark-theme & {
    background: $bg-muted-dark;
    color: $text-tertiary-dark;
  }

  &.expanded {
    transform: rotate(180deg);
    background: $danger-soft;
    color: $brand-red;
  }
}

.no-more {
  text-align: center;
  padding: $space-9 0;
}

.no-more-text {
  font-size: $font-sm;
  color: $text-tertiary-light;
  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner,
  .timeline-item,
  .expand-area,
  .chevron-icon {
    animation: none;
    transition: none;
  }
}
</style>