<template>
  <view class="raw-list">
    <SkeletonCard v-if="loading && logs.length === 0" :count="4" />

    <EmptyState v-else-if="error" tone="danger" title="加载失败" compact>
      <template #action>
        <MwpButton tone="danger" @click="$emit('retry')">重试</MwpButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="logs.length === 0"
      :title="filtered ? '没有匹配的日志' : '暂无操作记录'"
      :desc="
        filtered ? '换个关键词或类型试试' : '管理员审批 / 撤回后会显示在这里'
      "
    />

    <view v-else class="raw-items">
      <view
        v-for="(log, idx) in logs"
        :key="log.logId || idx"
        class="raw-item mwp-fade-in"
        :style="{ animationDelay: `${Math.min(idx * 40, 240)}ms` }"
      >
        <view class="raw-head">
          <text class="raw-time">{{ formatLogTime(log.actionTime) }}</text>
          <text
            class="raw-action"
            :class="
              log.actionType
                ? `raw-action--${log.actionType.toLowerCase()}`
                : ''
            "
            >{{
              log.actionType
                ? actionTextOf(log.actionType)
                : log.typeLabel || '变更'
            }}</text
          >
          <text class="raw-code">{{ log.actionType || '—' }}</text>
        </view>

        <view v-if="operatorText(log)" class="raw-line">
          <text class="raw-key">操作者</text>
          <text class="raw-val">{{ operatorText(log) }}</text>
        </view>

        <view class="raw-line">
          <text class="raw-key">目标</text>
          <text class="raw-val">{{ targetText(log) }}</text>
        </view>

        <view v-if="log.details?.reason" class="raw-line">
          <text class="raw-key">理由</text>
          <text class="raw-val">{{ log.details.reason }}</text>
        </view>

        <view v-if="log.details?.contribution" class="raw-line">
          <text class="raw-key">贡献值</text>
          <text class="raw-val">{{ log.details.contribution }}</text>
        </view>

        <view v-if="log.content" class="raw-line">
          <text class="raw-key">内容</text>
          <text class="raw-val">{{ log.content }}</text>
        </view>

        <view v-if="extraDetails(log)" class="raw-line">
          <text class="raw-key">详情</text>
          <text class="raw-val">{{ extraDetails(log) }}</text>
        </view>

        <text class="raw-ids"
          >logId {{ log.logId || '—' }} · proposalId
          {{ log.proposalId || '—' }}</text
        >
      </view>

      <view v-if="noMore && logs.length > 0" class="no-more">
        <text class="no-more-text">— 没有更多了 —</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {
  actionTextOf,
  formatLogTime,
  type LogItem
} from '@/utils/proposal-log';

defineProps<{
  logs: LogItem[];
  loading?: boolean;
  error?: boolean;
  noMore?: boolean;
  filtered?: boolean;
}>();

defineEmits<{
  (e: 'retry'): void;
  (e: 'proposal-click', id?: string): void;
}>();

const operatorText = (log: LogItem) => {
  const name = log.operatorName || '';
  const id = log.operatorId || '';
  if (name && id) return `${name} (${id})`;
  return name || id || '';
};

const targetText = (log: LogItem) => {
  const snapshot = log.proposalSnapshot;
  const parts: string[] = [];
  const name = snapshot?.courseName || snapshot?.title;
  if (name) parts.push(name);
  if (snapshot?.department) parts.push(snapshot.department);
  if (snapshot?.category) parts.push(snapshot.category);
  if (!parts.length)
    parts.push(log.typeLabel || (log.proposalId ? '提案' : '变更'));
  if (log.targetId) parts.push(`targetId ${log.targetId}`);
  if (log.proposalId) parts.push(`proposalId ${log.proposalId}`);
  return parts.join(' / ');
};

const extraDetails = (log: LogItem) => {
  const details = log.details;
  if (!details) return '';
  return Object.entries(details)
    .filter(
      ([key, value]) => key !== 'reason' && key !== 'contribution' && value
    )
    .map(([key, value]) => {
      const text = typeof value === 'object' ? JSON.stringify(value) : value;
      return `${key}=${text}`;
    })
    .join('  ');
};
</script>

<style lang="scss" scoped>
.raw-list {
  padding: $space-5 0;
}

.raw-items {
  display: flex;
  flex-direction: column;
}

.raw-item {
  padding: $space-5 0;
  border-bottom: 1rpx dashed $divider-light;
  transition: border-color $dur-fast $ease-standard;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }
}

.raw-head {
  display: flex;
  align-items: baseline;
  gap: $space-3;
  flex-wrap: wrap;
  margin-bottom: $space-3;
}

.raw-time {
  font-size: $font-xs;
  font-family: monospace;
  color: $text-tertiary-light;
  font-variant-numeric: tabular-nums;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.raw-action {
  font-size: $font-sm;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }

  &--create,
  &--update {
    color: $info;
  }
  &--approve,
  &--grant_admin {
    color: $success;
  }
  &--reject {
    color: $brand-red;
  }
  &--delete,
  &--revoke_admin {
    color: $warning-text;
  }

  .dark-theme & {
    &--create,
    &--update {
      color: $info-text-dark;
    }
    &--approve,
    &--grant_admin {
      color: $success-text-dark;
    }
    &--reject {
      color: $brand-red-soft;
    }
    &--delete,
    &--revoke_admin {
      color: $warning-text-dark;
    }
  }
}

.raw-code {
  font-size: $font-xs;
  font-family: monospace;
  letter-spacing: 0.5rpx;
  color: $text-placeholder-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-placeholder-dark;
  }
}

.raw-line {
  display: flex;
  gap: $space-4;
  margin-top: $space-2;
}

.raw-key {
  flex-shrink: 0;
  width: 96rpx;
  font-size: $font-xs;
  font-family: monospace;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.raw-val {
  flex: 1;
  min-width: 0;
  font-size: $font-xs;
  font-family: monospace;
  color: $text-secondary-light;
  line-height: 1.6;
  word-break: break-all;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.raw-ids {
  display: block;
  margin-top: $space-3;
  font-size: $font-xs;
  font-family: monospace;
  color: $text-placeholder-light;
  line-height: 1.5;
  word-break: break-all;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-placeholder-dark;
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
  .raw-item {
    animation: none;
  }
}
</style>
