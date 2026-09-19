<template>
  <view class="skeleton-list">
    <view
      v-for="i in count"
      :key="i"
      class="skeleton-card mwp-stagger-item"
      :style="{ animationDelay: `${(i - 1) * 60}ms` }"
    >
      <view class="skeleton-line skeleton-title" />
      <view class="skeleton-row">
        <view class="skeleton-circle" />
        <view class="skeleton-text-block">
          <view class="skeleton-line skeleton-text" />
          <view class="skeleton-line skeleton-text short" />
        </view>
      </view>
      <view class="skeleton-tags">
        <view v-for="j in 3" :key="j" class="skeleton-chip" />
      </view>
      <view class="skeleton-footer">
        <view class="skeleton-line skeleton-action" />
        <view class="skeleton-line skeleton-meta" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 卡片骨架屏列表
 * @param count 显示几张骨架卡（默认3）
 */
withDefaults(defineProps<{ count?: number }>(), { count: 3 });
</script>

<style lang="scss" scoped>
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.skeleton-card {
  padding: $space-7;
  border-radius: $radius-card;
  background: $bg-card-light;
  box-shadow: $shadow-card;
  transition: background-color $dur-medium $ease-standard,
    box-shadow $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
    box-shadow: $shadow-sm-dark;
  }
}

.skeleton-line {
  height: 28rpx;
  border-radius: $radius-xs;
  margin-bottom: $space-4;
  @include shimmer;

  &.skeleton-title {
    height: 40rpx;
    width: 70%;
  }
  &.skeleton-text {
    width: 50%;
    height: 24rpx;
    margin-bottom: $space-3;
  }
  &.skeleton-text.short {
    width: 35%;
    height: 24rpx;
    margin-bottom: 0;
  }
  &.skeleton-action {
    width: 40%;
    height: 56rpx;
    border-radius: $radius-pill;
  }
  &.skeleton-meta {
    width: 30%;
    height: 24rpx;
  }
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: $space-3;
  margin-bottom: $space-5;
}

.skeleton-text-block {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.skeleton-circle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  flex-shrink: 0;
  @include shimmer;
}

.skeleton-tags {
  display: flex;
  gap: $space-3;
  margin-bottom: $space-5;
}

.skeleton-chip {
  width: 120rpx;
  height: 40rpx;
  border-radius: $radius-pill;
  @include shimmer;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $space-4;
  @include dashed-divider;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

// 暗色：用低透明白色扫光，避免亮块刺眼
.dark-theme .skeleton-line,
.dark-theme .skeleton-circle,
.dark-theme .skeleton-chip {
  @include shimmer-dark;
}
</style>
