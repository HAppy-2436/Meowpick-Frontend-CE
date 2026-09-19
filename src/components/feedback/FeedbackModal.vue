<template>
  <view v-if="visible" class="feedback-overlay mwp-fade-in" @click="close">
    <view
      class="feedback-card mwp-bounce-in"
      :class="themeStore.themeClass"
      @click.stop
    >
      <view class="feedback-header">
        <text class="feedback-title">反馈</text>
        <view
          class="feedback-close mwp-pressable"
          hover-class="mwp-hover"
          @click="close"
          >×</view
        >
      </view>

      <view class="feedback-body">
        <text class="feedback-desc"
          >遇到问题或有建议？点击下方框即可复制对应联系方式</text
        >

        <view
          v-for="item in contactItems"
          :key="item.key"
          class="feedback-section mwp-stagger-item"
          :style="{ animationDelay: `${item.delay}ms` }"
          hover-class="mwp-hover"
          @click="handleCopy(item)"
        >
          <view class="feedback-section-header">
            <text class="feedback-label">{{ item.label }}</text>
            <text class="feedback-hint">点击复制</text>
          </view>
          <view class="feedback-value">{{ item.value }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/config';
import { CONTACT_INFO, copyToClipboard } from '@/utils/contact-info';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>();

const themeStore = useThemeStore();

interface ContactItem {
  key: string;
  label: string;
  value: string;
  delay: number;
}

const contactItems: ContactItem[] = [
  {
    key: 'qq',
    label: 'QQ 群',
    value: `群号 ${CONTACT_INFO.qqGroup.number}`,
    delay: 80
  },
  { key: 'email', label: '邮箱', value: CONTACT_INFO.email.address, delay: 160 }
];

const handleCopy = (item: ContactItem) => {
  const text =
    item.key === 'qq'
      ? CONTACT_INFO.qqGroup.number
      : CONTACT_INFO.email.address;
  const msg = item.key === 'qq' ? '已复制群号' : '已复制邮箱';
  copyToClipboard(text, msg);
};

const close = () => {
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.feedback-overlay {
  position: fixed;
  inset: 0;
  background: $bg-overlay-light;
  z-index: $z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-9;
  box-sizing: border-box;
}

.feedback-card {
  width: 100%;
  max-width: 600rpx;
  max-height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: $bg-card-light;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-lg;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
  }
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-7;
  border-bottom: 1rpx solid $divider-light;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-bottom-color: $divider-dark;
  }
}

.feedback-title {
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.feedback-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-2xl;
  color: $text-tertiary-light;
  text-align: center;
  line-height: 1;
  transition: background-color $dur-fast $ease-standard,
    color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }

  &:active {
    background: $bg-muted-light;
    color: $text-secondary-light;
    .dark-theme & {
      background: $bg-muted-dark;
      color: $text-secondary-dark;
    }
  }
}

.feedback-body {
  padding: $space-7 $space-9;
}

.feedback-desc {
  font-size: $font-md;
  color: $text-secondary-light;
  line-height: 1.6;
  margin-bottom: $space-7;
  display: block;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.feedback-section {
  margin-bottom: $space-7;
  padding: $space-5;
  background: $bg-muted-light;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  @include mwp-transition($dur-fast, $ease-standard);
  cursor: pointer;

  .dark-theme & {
    background: $bg-muted-dark;
  }

  &:active {
    transform: scale($press-scale-md);
    border-color: $brand-red;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.feedback-section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: $space-3;
}

.feedback-label {
  font-size: $font-md;
  font-weight: $weight-semibold;
  color: $text-primary-light;
  text-align: left;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.feedback-hint {
  font-size: $font-xs;
  color: $text-tertiary-light;
  text-align: right;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.feedback-value {
  font-size: $font-lg;
  color: $text-primary-light;
  font-family: monospace;
  font-weight: $weight-medium;
  letter-spacing: 1rpx;
  text-align: center;
  padding: $space-5;
  background: $bg-card-light;
  border-radius: $radius-sm;
  word-break: break-all;
  transition: background-color $dur-fast $ease-standard,
    color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
    background: $bg-card-dark;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feedback-overlay,
  .feedback-card,
  .feedback-section {
    animation: none;
    transition: none;
  }
}
</style>
