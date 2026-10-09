<template>
  <!-- root-portal：脱离 swiper / scroll-view 等被 transform 的祖先，避免 fixed 被 tab bar 遮挡 -->
  <root-portal>
    <view
      v-if="visible"
      class="mwp-confirm mwp-fade-in"
      :class="themeStore.themeClass"
      @click="handleCancel"
    >
      <view class="mwp-confirm__card mwp-scale-in" @click.stop>
        <text v-if="title" class="mwp-confirm__title">{{ title }}</text>
        <text v-if="description" class="mwp-confirm__desc">{{
          description
        }}</text>

        <!-- 附加内容插槽：用于补充输入项等自定义内容 -->
        <view v-if="$slots.default" class="mwp-confirm__extra">
          <slot />
        </view>

        <view class="mwp-confirm__footer">
          <MwpButton
            v-if="cancelText"
            class="mwp-confirm__btn"
            tone="plain"
            size="lg"
            block
            @click="handleCancel"
          >
            {{ cancelText }}
          </MwpButton>
          <MwpButton
            class="mwp-confirm__btn"
            :tone="tone === 'danger' ? 'danger-outline' : 'brand'"
            size="lg"
            block
            :disabled="confirmDisabled"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </MwpButton>
        </view>
      </view>
    </view>
  </root-portal>
</template>

<script setup lang="ts">
/**
 * 居中确认弹窗（确认后果 / 告知）
 *
 * 与 MwpActionSheet（底部，用于「做选择」）分工：
 *   - 破坏性、不可恢复的操作确认（删除 / 撤回）→ 本组件，tone="danger"，
 *     确认键为提案页「拒绝」同款白底红边框
 *   - 普通确认（通过 / 发布）→ 本组件，tone="brand"，确认键为品牌渐变
 *   - 纯告知、无取消项 → cancelText=""，只保留一个确认按钮
 *
 * 用法：
 *   <MwpConfirmDialog
 *     v-model:visible="show"
 *     title="撤回确认"
 *     description="撤回后无法恢复，确定撤回吗？"
 *     confirm-text="撤回"
 *     tone="danger"
 *     @confirm="doDelete"
 *   />
 */
import { withDefaults } from 'vue';
import { useThemeStore } from '@/config';

const themeStore = useThemeStore();

withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    /** 传空字符串则不显示取消按钮，确认按钮通栏 */
    cancelText?: string;
    tone?: 'brand' | 'danger';
    /** 确认按钮是否禁用（如未满足输入条件） */
    confirmDisabled?: boolean;
  }>(),
  {
    title: '',
    description: '',
    confirmText: '确认',
    cancelText: '取消',
    tone: 'brand',
    confirmDisabled: false
  }
);

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm' | 'cancel'): void;
}>();

const handleConfirm = () => {
  emit('confirm');
  emit('update:visible', false);
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>

<style lang="scss" scoped>
.mwp-confirm {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: $bg-overlay-light;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $space-9;

  &.dark-theme {
    background: $bg-overlay-dark;
  }
}

.mwp-confirm__card {
  width: 100%;
  max-width: 600rpx;
  box-sizing: border-box;
  padding: $space-9 $space-8 $space-8;
  background: $bg-card-light;
  border-radius: $radius-card;
  box-shadow: $shadow-xl;

  .dark-theme & {
    background: $bg-card-dark;
    box-shadow: $shadow-xl-dark;
  }
}

.mwp-confirm__title {
  display: block;
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;
  text-align: center;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.mwp-confirm__desc {
  display: block;
  margin-top: $space-5;
  font-size: $font-base;
  line-height: 1.6;
  color: $text-secondary-light;
  text-align: center;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.mwp-confirm__extra {
  margin-top: $space-6;
}

.mwp-confirm__footer {
  display: flex;
  gap: $space-4;
  margin-top: $space-8;
}

.mwp-confirm__btn {
  flex: 1;
}
</style>
