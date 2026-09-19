<template>
  <view class="mwp-plus-icon" :style="rootStyle">
    <view class="mwp-plus-icon__bar" :style="barStyle" />
    <view class="mwp-plus-icon__bar-v" :style="barVStyle" />
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: string;
    thickness?: string;
    length?: string;
  }>(),
  {
    size: '40rpx',
    thickness: '4rpx',
    length: ''
  }
);

const barLength = computed(() => {
  if (props.length) return props.length;
  const value = parseFloat(props.size);
  return Number.isNaN(value) ? props.size : `${value * 0.72}rpx`;
});

const rootStyle = computed(() => ({
  width: props.size,
  height: props.size
}));

const barStyle = computed(() => ({
  width: barLength.value,
  height: props.thickness
}));

const barVStyle = computed(() => ({
  width: props.thickness,
  height: barLength.value
}));
</script>

<style lang="scss" scoped>
.mwp-plus-icon {
  position: relative;
  display: block;
  flex-shrink: 0;
}

.mwp-plus-icon__bar,
.mwp-plus-icon__bar-v {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: currentColor;
  border-radius: $radius-pill;
}
</style>
