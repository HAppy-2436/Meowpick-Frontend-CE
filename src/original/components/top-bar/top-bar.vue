<template>
  <view class="top-bar">
    <view class="tap-bar">
      <view
        v-for="(item, index) of tabBarList"
        :key="item.id"
        class="tab-bar-item"
        :class="{ currentTar: selected === item.id }"
        @tap="switchTab(item.pagePath)"
      >
        <view
          class="tab-text"
          :style="{
            fontWeight: selected === index ? 'bold' : 'normal',
            fontSize: selected === index ? '4.5vw' : '4vw',
            letterSpacing: selected === index ? '0.6vw' : '0.3vw'
          }"
        >
          {{ item.text }}
        </view>
      </view>
    </view>
  </view>
  <view class="ellipse" />
</template>

<script setup lang="ts">
import { switchTabPage } from "@/original/utils/navigation";

defineProps<{
  selected: number;
}>();

const tabBarList = [
  {
    id: 0,
    pagePath: "/original/pages/home/home",
    text: "搜索"
  },
  {
    id: 1,
    pagePath: "/original/pages/my-comments/my-comments",
    text: "我的"
  },
  {
    id: 2,
    pagePath: "/original/pages/proposal/list",
    text: "提案"
  }
];

const switchTab = (page: string) => {
  switchTabPage(page);
};
</script>

<style scoped lang="scss">
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 25vw;
  z-index: 20;

  .tap-bar {
    margin-top: 14vw;
    margin-left: 3vw;
    display: grid;
    width: 50vw;
    grid-template-columns: repeat(3, 1fr);
    align-items: end;

    .tab-bar-item {
      position: relative;
      display: flex;
      justify-content: center;
      width: 100%;
      color: #ffffff;
      font-size: 4vw;
      letter-spacing: 0.5vw;
    }

    .currentTar::after {
      content: "";
      position: absolute;
      top: calc(100% + 2vw);
      left: 50%;
      width: 6.4vw;
      height: 1vw;
      border-radius: 0.5vw;
      background-color: #ffffff;
      transform: translateX(-50%);
    }
  }
}

.ellipse {
  position: fixed;
  top: 21vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 10;
}
</style>
