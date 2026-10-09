<template>
  <view class="mwp-icon" :style="style" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ICONS, type IconName } from '@/icons';

const props = withDefaults(
  defineProps<{
    name: IconName;
    size?: string;
    color?: string;
    strokeWidth?: number;
  }>(),
  { color: 'currentColor' }
);

const style = computed(() => {
  let svg: string = ICONS[props.name];
  if (props.strokeWidth) {
    svg = svg.replace(
      /stroke-width="[^"]*"/,
      `stroke-width="${props.strokeWidth}"`
    );
  }
  const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return [
    props.size ? `width:${props.size}` : '',
    props.size ? `height:${props.size}` : '',
    `background-color:${props.color}`,
    `-webkit-mask-image:${url}`,
    '-webkit-mask-repeat:no-repeat',
    '-webkit-mask-position:center',
    '-webkit-mask-size:contain',
    `mask-image:${url}`,
    'mask-repeat:no-repeat',
    'mask-position:center',
    'mask-size:contain'
  ]
    .filter(Boolean)
    .join(';');
});
</script>

<style lang="scss">
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.mwp-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
