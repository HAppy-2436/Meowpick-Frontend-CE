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
    </view>

    <text class="content-section">{{ data.content || data.text }}</text>

    <view class="footer-section">
      <text class="date-str">{{ format(data.createdAt || data.crateAt || '') }}</text>
      <view class="like-block mwp-pressable" @click="like">
        <image
          :src="data.relation?.like ? Liked : Like"
          class="icon-small"
          :class="{ 'is-liked': data.relation?.like }"
          mode="aspectFit"
        />
        <text class="count">{{ data.relation?.like_cnt || 0 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DtoCommentVO } from '@/api/data-contracts';
import { useThemeStore } from '@/config';
import Like from '@/images/like-icon.png';
import Liked from '@/images/like_active.png';
import { format as formatTime } from './utils';
import { Emoji } from '@/utils/tags';

const themeStore = useThemeStore();

type CommentBoxProps = { data: DtoCommentVO };
const props = defineProps<CommentBoxProps>();
const emit = defineEmits<{ like: [id: string] }>();

const format = (time: string) => formatTime(time);

const like = () => emit('like', props.data.id);

const textTags = (tags: string[]) => tags || [];
</script>

<style lang="scss" scoped>
@import "@/styles/index.scss";

.comment-box {
  background: $bg-card-light;
  border-radius: $radius-md;
  padding: $space-6;
  margin-bottom: $space-6;
  box-shadow: $shadow-sm;
  transition: background-color $dur-medium $ease-standard,
              box-shadow $dur-medium $ease-standard,
              transform $dur-fast $ease-standard;
  animation: mwp-fade-up 360ms $ease-decelerate both;

  .dark-theme & {
    background: $bg-card-dark;
  }

  &:active {
    transform: scale($press-scale-md);
  }
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: $space-4;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx $space-3;
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
  width: 28rpx;
  height: 28rpx;
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
  align-items: center;
}

.date-str {
  font-size: $font-xs;
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
  padding: 4rpx $space-3;
  border-radius: $radius-pill;
  transition: background-color $dur-fast $ease-standard;

  &:active {
    background: $bg-muted-light;
    .dark-theme & {
      background: $bg-muted-dark;
    }
  }
}

.icon-small {
  width: 32rpx;
  height: 32rpx;
  margin-right: $space-2;
  transition: transform $dur-base $ease-spring;

  &.is-liked {
    animation: mwp-heart-beat 480ms $ease-spring;
  }
}

.count {
  font-size: $font-sm + 2rpx;
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