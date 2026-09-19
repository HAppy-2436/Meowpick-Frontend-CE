<template>
  <view class="group-list">
    <SkeletonCard v-if="loading && groups.length === 0" :count="4" />

    <EmptyState v-else-if="error" tone="danger" title="加载失败" compact>
      <template #action>
        <MwpButton tone="danger" @click="$emit('retry')">重试</MwpButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="groups.length === 0"
      :title="filtered ? '没有匹配的日志' : '暂无操作记录'"
      :desc="
        filtered ? '换个关键词或类型试试' : '管理员审批 / 撤回后会显示在这里'
      "
    />

    <view v-else class="group-items">
      <view
        v-for="(group, idx) in groups"
        :key="group.key"
        class="group-item mwp-stagger-item"
        :style="{ animationDelay: `${Math.min(idx * 60, 300)}ms` }"
      >
        <view
          class="group-card mwp-pressable"
          hover-class="mwp-hover"
          @click="toggle(group.key)"
        >
          <view class="group-body">
            <text class="course-name">{{ courseNameOf(group) }}</text>

            <template v-if="hasActions(group)">
              <view v-if="creatorLogOf(group)" class="summary-row">
                <text class="summary-key">发起</text>
                <text class="summary-val">{{
                  operatorOf(creatorLogOf(group))
                }}</text>
              </view>

              <view v-if="latestAdminOf(group)" class="summary-row">
                <text class="summary-key">最近</text>
                <text
                  class="summary-act"
                  :class="`act--${(
                    latestAdminOf(group)?.actionType || ''
                  ).toLowerCase()}`"
                  >{{ actionTextOf(latestAdminOf(group)?.actionType) }}</text
                >
                <text class="summary-val">{{
                  operatorOf(latestAdminOf(group))
                }}</text>
              </view>
            </template>

            <view v-else-if="contentOf(group)" class="summary-row">
              <text class="summary-key">{{ group.typeLabel || '内容' }}</text>
              <text class="summary-val">{{ contentOf(group) }}</text>
            </view>

            <view class="group-meta">
              <text class="time">{{ latestTimeOf(group) }}</text>
              <text class="dot-sep">·</text>
              <text class="count">共 {{ group.logs.length }} 次操作</text>
            </view>

            <view v-if="isOpen(group.key)" class="group-expand">
              <view v-if="snapshotOf(group)" class="info-rows">
                <view v-if="snapshotOf(group)?.department" class="info-row">
                  <text class="info-key">院系</text>
                  <text class="info-val">{{
                    snapshotOf(group)?.department
                  }}</text>
                </view>
                <view v-if="snapshotOf(group)?.category" class="info-row">
                  <text class="info-key">分类</text>
                  <text class="info-val">{{
                    snapshotOf(group)?.category
                  }}</text>
                </view>
              </view>

              <view class="op-list">
                <view
                  v-for="(log, opIdx) in group.logs"
                  :key="log.logId || opIdx"
                  class="op-item"
                >
                  <view class="op-axis">
                    <view
                      class="op-dot"
                      :class="`dot-${(log.actionType || '').toLowerCase()}`"
                    />
                    <view
                      v-if="opIdx !== group.logs.length - 1"
                      class="op-line"
                    />
                  </view>
                  <view class="op-body">
                    <view class="op-head">
                      <text
                        v-if="log.actionType"
                        class="op-action"
                        :class="`act--${log.actionType.toLowerCase()}`"
                        >{{ actionTextOf(log.actionType) }}</text
                      >
                      <text v-else class="op-action">{{
                        log.typeLabel || '变更'
                      }}</text>
                      <text class="op-time">{{
                        formatLogTime(log.actionTime)
                      }}</text>
                    </view>
                    <text class="op-meta">{{ operatorOf(log) }}</text>
                    <text v-if="detailOf(log)" class="op-detail">
                      {{ detailOf(log) }}
                    </text>
                  </view>
                </view>
              </view>

              <view
                v-if="group.proposalId"
                class="proposal-link"
                hover-class="mwp-hover"
                @click.stop="$emit('proposal-click', group.proposalId)"
              >
                <text>查看提案</text>
                <MwpIcon name="chevron-right" size="28rpx" class="link-arrow" />
              </view>
            </view>
          </view>

          <view class="chevron-icon" :class="{ expanded: isOpen(group.key) }" />
        </view>
      </view>

      <view v-if="noMore && groups.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  actionTextOf,
  formatLogTime,
  latestOf,
  snapshotOf,
  type LogItem,
  type ProposalLogGroup
} from '@/utils/proposal-log';

defineProps<{
  groups: ProposalLogGroup[];
  loading?: boolean;
  error?: boolean;
  noMore?: boolean;
  filtered?: boolean;
}>();

defineEmits<{
  (e: 'retry'): void;
  (e: 'proposal-click', id?: string): void;
}>();

const openKeys = ref<Set<string>>(new Set());

const isOpen = (key: string) => openKeys.value.has(key);

const toggle = (key: string) => {
  if (openKeys.value.has(key)) openKeys.value.delete(key);
  else openKeys.value.add(key);
  openKeys.value = new Set(openKeys.value);
};

const courseNameOf = (group: ProposalLogGroup) => {
  const snapshot = snapshotOf(group);
  const name = snapshot?.courseName || snapshot?.title;
  if (name) return name;
  if (group.typeLabel) return group.typeLabel;
  if (group.proposalId) return '未知课程';
  return hasActions(group) ? '权限变更' : '变更记录';
};

const hasActions = (group: ProposalLogGroup) =>
  group.logs.some((log) => log.actionType);

const creatorLogOf = (group: ProposalLogGroup) =>
  group.logs.find((log) => log.actionType === 'CREATE');

const latestAdminOf = (group: ProposalLogGroup) => {
  const admins = group.logs.filter((log) => log.actionType !== 'CREATE');
  return admins[admins.length - 1];
};

const contentOf = (group: ProposalLogGroup) =>
  group.logs.find((log) => log.content)?.content || '';

const latestTimeOf = (group: ProposalLogGroup) =>
  formatLogTime(latestOf(group)?.actionTime);

const operatorOf = (log?: LogItem) =>
  log?.operatorName || log?.operatorId || '系统';

const detailOf = (log: LogItem) => {
  const details = log.details;
  if (!details) return log.content || '';
  if (details.reason) return `拒绝原因：${details.reason}`;
  if (details.contribution) return `贡献值：${details.contribution}`;
  return log.content || '';
};
</script>

<style lang="scss" scoped>
.group-list {
  padding: $space-5 0;
}

.group-item {
  position: relative;
  margin-bottom: $space-5;
}

.group-card {
  @include card($radius-card, $space-6);
  display: flex;
  align-items: center;
  gap: $space-4;

  .dark-theme & {
    @include card-dark($radius-card, $space-6);
  }
}

.group-body {
  flex: 1;
  min-width: 0;
}

.course-name {
  font-size: $font-base;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  display: block;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.summary-row {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-top: $space-2;
}

.summary-key {
  flex-shrink: 0;
  width: 56rpx;
  font-size: $font-xs;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.summary-act {
  font-size: $font-sm;
  font-weight: $weight-semibold;
}

.summary-val {
  font-size: $font-xs;
  color: $text-secondary-light;
  min-width: 0;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.group-meta {
  display: flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-3;
  font-size: $font-xs;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.dot-sep {
  opacity: 0.5;
}

.time,
.count {
  font-variant-numeric: tabular-nums;
}

.group-expand {
  margin-top: $space-5;
  padding-top: $space-5;
  @include dashed-divider;
  transition: border-color $dur-fast $ease-standard;
  animation: mwp-fade-up $motion-pop $ease-decelerate backwards;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin-bottom: $space-5;
}

.info-row {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.info-key {
  flex-shrink: 0;
  width: 56rpx;
  font-size: $font-xs;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.info-val {
  flex: 1;
  min-width: 0;
  font-size: $font-xs;
  color: $text-secondary-light;
  @include ellipsis;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.op-list {
  display: flex;
  flex-direction: column;
}

.op-item {
  position: relative;
  display: flex;
  gap: $space-4;
  padding-bottom: $space-5;

  &:last-child {
    padding-bottom: 0;
  }
}

.op-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16rpx;
  flex-shrink: 0;
}

.op-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-top: $space-2;
  background: $text-tertiary-light;
  flex-shrink: 0;

  &.dot-create,
  &.dot-update {
    background: $info;
    box-shadow: 0 0 0 4rpx $info-soft;
  }
  &.dot-approve,
  &.dot-grant_admin {
    background: $success;
    box-shadow: 0 0 0 4rpx $success-soft;
  }
  &.dot-reject {
    background: $brand-red;
    box-shadow: 0 0 0 4rpx $danger-soft;
  }
  &.dot-delete,
  &.dot-revoke_admin {
    background: $warning;
    box-shadow: 0 0 0 4rpx $warning-soft;
  }
}

.op-line {
  flex: 1;
  width: 2rpx;
  margin-top: $space-2;
  background: $divider-light;
  transition: background-color $dur-fast $ease-standard;

  .dark-theme & {
    background: $divider-dark;
  }
}

.op-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.op-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $space-3;
}

.op-action {
  font-size: $font-sm;
  font-weight: $weight-semibold;
}

.op-time {
  font-size: $font-xs;
  color: $text-tertiary-light;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.op-meta {
  font-size: $font-xs;
  color: $text-secondary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.op-detail {
  font-size: $font-sm;
  color: $text-primary-light;
  line-height: 1.6;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.act--create,
.act--update {
  color: $info;
}
.act--approve,
.act--grant_admin {
  color: $success;
}
.act--reject {
  color: $brand-red;
}
.act--delete,
.act--revoke_admin {
  color: $warning-text;
}

.dark-theme {
  .act--create,
  .act--update {
    color: $info-text-dark;
  }
  .act--approve,
  .act--grant_admin {
    color: $success-text-dark;
  }
  .act--reject {
    color: $brand-red-soft;
  }
  .act--delete,
  .act--revoke_admin {
    color: $warning-text-dark;
  }
}

.proposal-link {
  display: inline-flex;
  align-items: center;
  gap: $space-2;
  margin-top: $space-5;
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
  color: $brand-red;
}

.chevron-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjNzY3Njc2JyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNNiA5TDEyIDE1TDE4IDknLz48L3N2Zz4=');
  transform-origin: center center;
  transition: transform $dur-base $ease-emphasized;

  .dark-theme & {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjOWE5YTlhJyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNNiA5TDEyIDE1TDE4IDknLz48L3N2Zz4=');
  }

  &.expanded {
    transform: rotate(180deg);
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjYjIwMDM1JyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNNiA5TDEyIDE1TDE4IDknLz48L3N2Zz4=');

    .dark-theme & {
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmY0ZDZhJyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNNiA5TDEyIDE1TDE4IDknLz48L3N2Zz4=');
    }
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
  .group-item,
  .group-expand,
  .chevron-icon {
    animation: none;
    transition: none;
  }
}
</style>
