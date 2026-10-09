<template>
  <view
    v-if="visible"
    class="app-dialog-mask"
    :class="{ 'has-input': showInput }"
    @click="handleMaskClick"
    @touchmove.stop.prevent
  >
    <view class="app-dialog" @click.stop>
      <view class="dialog-handle" />
      <text class="dialog-title">{{ title }}</text>
      <text v-if="message" class="dialog-message">{{ message }}</text>

      <view v-if="showInput" class="dialog-input-wrap">
        <input
          class="dialog-input"
          type="text"
          :value="modelValue"
          :placeholder="placeholder"
          :maxlength="maxLength"
          :focus="visible"
          :adjust-position="true"
          :cursor-spacing="24"
          @input="handleInput"
          @confirm="handleConfirm"
        />
        <text class="input-count">{{ modelValue.length }}/{{ maxLength }}</text>
      </view>

      <view class="dialog-actions">
        <button class="dialog-btn cancel-btn" :disabled="loading" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="dialog-btn confirm-btn" :disabled="loading" @click="handleConfirm">
          {{ loading ? '处理中...' : confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  visible: boolean;
  title: string;
  message?: string;
  showInput?: boolean;
  modelValue?: string;
  placeholder?: string;
  maxLength?: number;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  closeOnMask?: boolean;
}>(), {
  message: '',
  showInput: false,
  modelValue: '',
  placeholder: '',
  maxLength: 20,
  confirmText: '确定',
  cancelText: '取消',
  loading: false,
  closeOnMask: true
});

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'update:modelValue', value: string): void;
  (event: 'confirm', value: string): void;
  (event: 'cancel'): void;
}>();

const handleInput = (event: any) => {
  emit('update:modelValue', String(event.detail?.value || ''));
};

const handleCancel = () => {
  if (props.loading) return;
  emit('update:visible', false);
  emit('cancel');
};

const handleConfirm = () => {
  if (props.loading) return;
  emit('confirm', props.modelValue);
};

const handleMaskClick = () => {
  if (props.closeOnMask) handleCancel();
};
</script>

<style scoped lang="scss">
.app-dialog-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 8vw;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(2px);
}

.app-dialog {
  width: 100%;
  padding: 5vw;
  background: #ffffff;
  border-radius: var(--app-component-radius, 5vw);
  box-shadow: 0 3vw 10vw rgba(0, 0, 0, 0.18);
}

.app-dialog-mask.has-input .app-dialog {
  transform: translateY(-7vh);
}

.dialog-handle {
  width: 10vw;
  height: 1vw;
  margin: 0 auto 4vw;
  border-radius: var(--app-component-radius, 5vw);
  background: #b70030;
}

.dialog-title {
  display: block;
  color: #222222;
  font-size: 4.8vw;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
}

.dialog-message {
  display: block;
  margin-top: 2vw;
  color: #777777;
  font-size: 3.3vw;
  line-height: 1.6;
  text-align: center;
  white-space: pre-line;
}

.dialog-input-wrap {
  position: relative;
  margin-top: 4vw;
}

.dialog-input {
  width: 100%;
  height: 12vw;
  padding: 0 13vw 0 4vw;
  box-sizing: border-box;
  color: #222222;
  background: #f7f7f7;
  border: 1px solid #ededed;
  border-radius: var(--app-component-radius, 5vw);
  font-size: 3.8vw;
}

.input-count {
  position: absolute;
  top: 50%;
  right: 4vw;
  color: #aaaaaa;
  font-size: 2.8vw;
  transform: translateY(-50%);
}

.dialog-actions {
  display: flex;
  gap: 3vw;
  margin-top: 5vw;
}

.dialog-btn {
  flex: 1;
  height: 11vw;
  padding: 0;
  border: none;
  border-radius: var(--app-component-radius, 5vw);
  font-size: 3.7vw;
  font-weight: 600;
  line-height: 11vw;

  &::after {
    border: none;
  }
}

.cancel-btn {
  color: #555555;
  background: #f2f2f2;
}

.confirm-btn {
  color: #ffffff;
  background: #b70030;
}

.dialog-btn[disabled] {
  opacity: 0.55;
}
</style>
