<template>
  <!-- root-portal：脱离 swiper / scroll-view 等被 transform 的祖先，避免 fixed 被遮挡 -->
  <root-portal>
    <view
      v-if="visible"
      class="nickname-mask mwp-fade-in"
      :class="themeStore.themeClass"
      @click="close"
    >
      <view class="nickname-card mwp-scale-in" @click.stop>
        <view class="nickname-header">
          <text class="nickname-title">设置昵称</text>
          <view
            class="nickname-close mwp-pressable"
            hover-class="mwp-hover"
            :hover-start-time="0"
            :hover-stay-time="0"
            @click="close"
          >
            <MwpIcon name="x" size="30rpx" />
          </view>
        </view>

        <view class="nickname-body">
          <text class="nickname-label"
            >输入昵称（点击输入框可获取微信昵称建议）</text
          >
          <input
            v-model="draft"
            class="nickname-input"
            type="nickname"
            :maxlength="15"
            placeholder="请输入昵称"
            placeholder-class="mwp-placeholder--lg"
          />
          <text class="nickname-count">已输入 {{ draft.length }}/15 字</text>
          <text class="nickname-tip"
            >设置后用于展示你的课程贡献，30 天内仅能修改一次</text
          >
        </view>

        <view class="nickname-footer">
          <MwpButton
            class="nickname-btn"
            tone="plain"
            size="lg"
            block
            @click="close"
          >
            取消
          </MwpButton>
          <MwpButton
            class="nickname-btn"
            tone="brand"
            size="lg"
            block
            :loading="saving"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? '保存中...' : '保存' }}
          </MwpButton>
        </view>
      </view>
    </view>
  </root-portal>
</template>

<script setup lang="ts">
/**
 * 设置昵称弹窗。
 *
 * 供提案发布页在「选择展示昵称但尚未设置昵称」时内联设置，保存成功后
 * emit('saved', username)，由调用方决定是否切换到展示。
 */
import { ref, watch } from 'vue';
import { http, useThemeStore } from '@/config';
import { showSuccess, showError } from '@/composables/useStatus';
import { errorMessageOf } from '@/utils/review-error';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'saved', username: string): void;
}>();

const themeStore = useThemeStore();

const draft = ref('');
const saving = ref(false);

// 每次打开清空输入（不回填当前昵称）
watch(
  () => props.visible,
  (visible) => {
    if (visible) draft.value = '';
  }
);

const close = () => {
  if (saving.value) return;
  emit('update:visible', false);
};

// 控制字符会被后端拒绝，提交前先拦截（与后端 \u0000-\u001f、\u007f-\u009f 对齐）
const hasControlChar = (value: string) =>
  Array.from(value).some((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return code <= 0x1f || (code >= 0x7f && code <= 0x9f);
  });

const save = async () => {
  const trimmed = draft.value.trim();
  if (!trimmed) {
    showError('昵称不能为空');
    return;
  }
  // 按 Unicode 码点计数，避免 emoji 被 UTF-16 单元多算
  if (Array.from(trimmed).length > 15) {
    showError('昵称不超过15个字符');
    return;
  }
  if (hasControlChar(trimmed)) {
    showError('昵称包含不可用字符，请修改后重试');
    return;
  }

  saving.value = true;
  try {
    const res = await http.UserController.userProfileUpdateCreate({
      username: trimmed
    });
    const code = res.data?.code;
    if (!(code === 200 || code === 0 || code === 201)) {
      showError(
        errorMessageOf(code, res.data?.msg) || '昵称修改失败，请稍后重试'
      );
      return;
    }
    const savedName = res.data?.data?.username || trimmed;
    // 同步本地缓存，与其他页面的昵称展示保持一致
    const stored = uni.getStorageSync('userInfo') || {};
    stored.nickName = savedName;
    stored.canEditUsername = false;
    uni.setStorageSync('userInfo', stored);
    uni.$emit('userInfoUpdated');
    showSuccess('昵称已更新');
    emit('saved', savedName);
    emit('update:visible', false);
  } catch (err) {
    const e = err as {
      response?: { data?: { code?: number; msg?: string } };
    };
    showError(
      errorMessageOf(e.response?.data?.code, e.response?.data?.msg) ||
        '修改失败，请重试'
    );
  } finally {
    saving.value = false;
  }
};
</script>

<style lang="scss" scoped>
.nickname-mask {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  background: $bg-overlay-light;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-9;
  box-sizing: border-box;

  &.dark-theme {
    background: $bg-overlay-dark;
  }
}

.nickname-card {
  width: 100%;
  max-width: 680rpx;
  background: $bg-card-light;
  border-radius: $radius-card;
  overflow: hidden;
  box-shadow: $shadow-xl;
  transition: background-color $dur-medium $ease-standard;

  .dark-theme & {
    background: $bg-card-dark;
    box-shadow: $shadow-xl-dark;
  }
}

.nickname-header {
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

.nickname-title {
  font-size: $font-lg;
  font-weight: $weight-bold;
  color: $text-primary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-primary-dark;
  }
}

.nickname-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-tertiary-light;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.nickname-body {
  padding: $space-8 $space-9;
  display: flex;
  flex-direction: column;
}

.nickname-label {
  font-size: $font-base;
  font-weight: $weight-medium;
  color: $text-secondary-light;
  margin-bottom: $space-4;
  transition: color $dur-fast $ease-standard;

  .dark-theme & {
    color: $text-secondary-dark;
  }
}

.nickname-input {
  width: 100%;
  height: 96rpx;
  background-color: $bg-muted-light;
  border-radius: $radius-control;
  padding: 0 28rpx;
  font-size: $font-lg;
  color: $text-primary-light;
  box-sizing: border-box;
  border: 2rpx solid transparent;
  transition: border-color $dur-base $ease-standard,
    background-color $dur-base $ease-standard;

  &:focus {
    border-color: $brand-red;
    background-color: $bg-card-light;

    .dark-theme & {
      background-color: $bg-card-dark;
      border-color: $brand-red-soft;
    }
  }

  .dark-theme & {
    color: $text-primary-dark;
    background-color: $bg-muted-dark;
  }
}

.nickname-count {
  font-size: $font-xs;
  color: $text-tertiary-light;
  text-align: right;
  margin-top: $space-2;
  display: block;

  .dark-theme & {
    color: $text-tertiary-dark;
  }
}

.nickname-tip {
  display: block;
  margin-top: $space-4;
  font-size: $font-xs;
  color: $brand-red;
  line-height: 1.5;

  .dark-theme & {
    color: $brand-red-soft;
  }
}

.nickname-footer {
  display: flex;
  gap: $space-4;
  padding: $space-6 $space-9 $space-8;
  border-top: 1rpx solid $divider-light;
  transition: border-color $dur-fast $ease-standard;

  .dark-theme & {
    border-top-color: $divider-dark;
  }
}

.nickname-btn {
  flex: 1;
}

@media (prefers-reduced-motion: reduce) {
  .nickname-mask,
  .nickname-card {
    animation: none;
    transition: none;
  }
}
</style>
