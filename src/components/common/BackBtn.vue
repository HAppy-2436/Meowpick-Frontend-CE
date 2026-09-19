<template>
  <view
    class="back-btn"
    :class="themeStore.themeClass"
    :style="customStyle"
    hover-class="mwp-hover"
    @click="handleBack"
  >
    <view
      class="css-back-arrow"
      :class="{ 'is-light': color === '$bg-card-light' || color === 'white' }"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

const props = defineProps<{
  customStyle?: string | Record<string, string>;
  color?: string;
  /** 为 true 时不执行默认返回，仅抛出 back 事件交由父级处理 */
  intercept?: boolean;
}>();

const emit = defineEmits<{ (e: 'click' | 'back'): void }>();

const handleBack = () => {
  if (props.intercept) {
    emit('back');
    return;
  }
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/layout/main' });
  }
  emit('click');
};

const arrowStyle = computed(() => ({
  borderBottomColor: props.color || '$brand-red',
  borderLeftColor: props.color || '$brand-red'
}));
</script>

<style scoped lang="scss">
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  @include pressable(0.92);
}

// 矢量 chevron（内联 SVG，任意尺寸都清晰，不再用旋转的 rpx 短棒）
// stroke 颜色：浅色 $brand-red / 暗色 $brand-red-soft / is-light $pure-white
.css-back-arrow {
  width: 40rpx;
  height: 40rpx;
  // chevron 的视觉重心偏右，向左微调使其在热区中视觉居中
  margin-left: -3rpx;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjYjIwMDM1JyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNMTUgNUw4IDEyTDE1IDE5Jy8+PC9zdmc+');

  // 暗色下品牌红对比度偏低，提亮一档
  .dark-theme & {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmY0ZDZhJyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNMTUgNUw4IDEyTDE1IDE5Jy8+PC9zdmc+');
  }

  &.is-light {
    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPScjZmZmZmZmJyBzdHJva2Utd2lkdGg9JzIuNicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48cGF0aCBkPSdNMTUgNUw4IDEyTDE1IDE5Jy8+PC9zdmc+');
  }
}
</style>
