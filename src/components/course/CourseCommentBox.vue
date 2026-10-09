<template>
  <view class="comment-box" :class="themeStore.themeClass">
    <view class="header-section">
      <view class="tags-wrapper">
        <view
          v-for="(item, index) in textTags(data.tags || [])"
          :key="index"
          class="ctag mwp-stagger-item"
          :style="{ animationDelay: `${index * 60}ms` }"
        >
          <image v-if="Emoji(item)" :src="Emoji(item)" class="tag-icon" />
          <text class="txt">{{ item }}</text>
        </view>
      </view>

      <view
        v-if="canDelete"
        class="delete-btn mwp-pressable"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click.stop="onDelete"
      >
        <MwpIcon name="trash-2" size="32rpx" class="delete-icon" />
      </view>
    </view>

    <text class="content-section">{{ data.content }}</text>

    <view class="footer-section">
      <view
        class="like-block mwp-pressable"
        hover-class="mwp-hover"
        :hover-start-time="0"
        :hover-stay-time="0"
        @click="like"
      >
        <MwpIcon
          :name="data.like ? 'heart-filled' : 'heart'"
          size="32rpx"
          class="icon-small"
          :class="{ 'is-liked': data.like }"
        />
        <text class="count">{{ data.likeCnt || 0 }}</text>
      </view>
      <text class="date-str">{{ format(data.createdAt || '') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DtoCommentVO } from '@/api/data-contracts';
import { useThemeStore } from '@/config';
import { format as formatTime } from '@/composables/useCourseComment';
import { Emoji } from '@/utils/tags';

const themeStore = useThemeStore();

type CommentBoxProps = { data: DtoCommentVO; canDelete?: boolean };
const props = withDefaults(defineProps<CommentBoxProps>(), {
  canDelete: false
});
const emit = defineEmits<{ (e: 'like' | 'delete', id: string): void }>();

const format = (time: string) => formatTime(time);

const like = () => {
  emit('like', props.data.id || '');
};

const onDelete = () => {
  emit('delete', props.data.id || '');
};

const textTags = (tags: string[]) => tags || [];
</script>

<style lang="scss" scoped>
.comment-box {
  background: $bg-card-light;
  border-radius: $radius-card;
  padding: $space-6;
  margin-bottom: $space-6;
  box-shadow: $shadow-sm;
  transition: background-color $dur-medium $ease-standard,
    box-shadow $dur-medium $ease-standard;
  animation: mwp-fade-up $motion-enter-lg $ease-decelerate backwards;

  &.dark-theme {
    background: $bg-card-dark;
    box-shadow: $shadow-sm-dark;
  }
}

.header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $space-4;
}

.tags-wrapper {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx $space-3;
}

// 撤回/删除入口固定在卡片右上角：管理员删除他人评论，普通用户撤回自己的吐槽
.delete-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: $space-3;
  padding: $space-1;
  border-radius: $radius-pill;
  transition: background-color $dur-fast $ease-standard;
  position: relative;

  // 图标 32rpx，热区扩大到 88rpx，避免误触
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 88rpx;
    height: 88rpx;
    transform: translate(-50%, -50%);
  }

  &:active {
    background: $danger-soft;

    .dark-theme & {
      background: $danger-soft-dark;
    }
  }
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.ctag {
  display: inline-flex;
  align-items: center;
  background: $bg-muted-light;
  padding: 4rpx $space-4;
  border-radius: $radius-pill;
  transition: background-color $dur-fast $ease-standard;

  .dark-theme & {
    background: $bg-muted-dark;
  }
}

.tag-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: $space-2;
  display: block;
  flex-shrink: 0;
}

.txt {
  font-size: $font-xs;
  color: $text-secondary-light;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.content-section {
  font-size: $font-base;
  color: $text-primary-light;
  line-height: 1.6;
  margin-bottom: $space-5;
  text-align: left;
  display: block;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.footer-section {
  display: flex;
  justify-content: space-between;
  // 爱心贴到卡片内容底边，与左边距一致
  align-items: flex-end;
}

.date-str {
  font-size: $font-xs;
  line-height: 1;
  color: $text-tertiary-light;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.like-block {
  display: inline-flex;
  align-items: center;
  // 只留顶部内衬，避免底边被 padding 顶起
  padding: 4rpx 0 0;
  line-height: 1;
  transition: transform $dur-fast $ease-standard;

  &:active {
    transform: scale($press-scale-md);
  }
}

.icon-small {
  width: 32rpx;
  height: 32rpx;
  margin-right: $space-2;
  color: $brand-red;
  transition: transform $dur-base $ease-spring, color $dur-fast $ease-standard;

  .dark-theme & {
    color: $brand-red-soft;
  }

  &.is-liked {
    animation: mwp-heart-beat $motion-heart $ease-spring;
  }
}

.count {
  font-size: $font-sm-plus;
  line-height: 1;
  color: $text-secondary-light;
  font-weight: $weight-medium;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .comment-box,
  .ctag,
  .icon-small {
    animation: none;
  }
}
</style>
