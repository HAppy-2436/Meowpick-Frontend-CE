<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- 左耳 -->
    <path d="M30 48 L18 16 L48 36 Z" :fill="earColor" />
    <path d="M33 44 L24 22 L44 37 Z" :fill="earInner" />

    <!-- 右耳 -->
    <path d="M90 48 L102 16 L72 36 Z" :fill="earColor" />
    <path d="M87 44 L96 22 L76 37 Z" :fill="earInner" />

    <!-- 脸 -->
    <circle cx="60" cy="66" r="40" :fill="faceColor" />

    <!-- 左眼 -->
    <ellipse cx="46" cy="60" rx="4.5" ry="5" :fill="eyeColor" />
    <circle cx="44.5" cy="58" r="1.5" fill="white" opacity="0.8" />

    <!-- 右眼 -->
    <ellipse cx="74" cy="60" rx="4.5" ry="5" :fill="eyeColor" />
    <circle cx="72.5" cy="58" r="1.5" fill="white" opacity="0.8" />

    <!-- 鼻子 -->
    <path d="M57 70 L63 70 L60 74 Z" :fill="noseColor" />

    <!-- 嘴巴 -->
    <path d="M60 74 Q54 80 48 77" :stroke="mouthColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
    <path d="M60 74 Q66 80 72 77" :stroke="mouthColor" stroke-width="1.5" fill="none" stroke-linecap="round" />

    <!-- 左腮红 -->
    <ellipse cx="38" cy="74" rx="7" ry="4.5" :fill="blushColor" />
    <!-- 右腮红 -->
    <ellipse cx="82" cy="74" rx="7" ry="4.5" :fill="blushColor" />

    <!-- 左胡须 -->
    <line x1="12" y1="66" x2="36" y2="68" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />
    <line x1="14" y1="74" x2="36" y2="74" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />
    <line x1="16" y1="82" x2="37" y2="79" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />

    <!-- 右胡须 -->
    <line x1="108" y1="66" x2="84" y2="68" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />
    <line x1="106" y1="74" x2="84" y2="74" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />
    <line x1="104" y1="82" x2="83" y2="79" :stroke="whiskerColor" stroke-width="1" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/config/store/Theme';

const props = withDefaults(defineProps<{ size?: string | number }>(), {
  size: '100%',
});

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDark);

const faceColor = computed(() => isDark.value ? '#5c4033' : '#f5deb3');
const earColor = computed(() => isDark.value ? '#4a3328' : '#deb887');
const earInner = computed(() => isDark.value ? '#7a4a4a' : '#ffb6c1');
const eyeColor = computed(() => isDark.value ? '#2a1a0e' : '#3e2723');
const noseColor = computed(() => isDark.value ? '#c07070' : '#ff8a95');
const mouthColor = computed(() => isDark.value ? '#8a6a5a' : '#8d6e63');
const blushColor = computed(() => isDark.value ? 'rgba(180,80,80,0.25)' : 'rgba(255,138,149,0.35)');
const whiskerColor = computed(() => isDark.value ? '#9a8070' : '#a1887f');
</script>
