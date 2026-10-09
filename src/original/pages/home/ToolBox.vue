<template>
  <view class="tool-box">
    <view class="to-users">
      <view class="letter-container" @click="goToLetter">
        <view class="tool-card">
          <view class="card-icon mail-icon" aria-hidden="true" />
          <text class="card-title">给用户的一封信</text>
          <view class="card-arrow" aria-hidden="true" />
        </view>
        <view v-if="showNewIcon" class="new-badge">NEW</view>
      </view>
      <view class="tool-card" @click="goToUpdate">
        <view class="card-icon clock-icon" aria-hidden="true" />
        <text class="card-title">版本更新日志</text>
        <view class="card-arrow" aria-hidden="true" />
      </view>
    </view>
    <view class="total-comments">
      <view class="box">
        <view class="title">已收录吐槽总数</view>
        <view class="number">{{ totalComment }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { http } from '@/original/config';
import { navigateToPage } from "@/original/utils/navigation";

const showPanel1 = ref(false);
const showPanel2 = ref(false);
const totalComment = ref(0);
const showNewIcon = ref(true);

onShow(() => {
  http.CommentController.searchTotalList().then((res) => {
    const responseData = res.data.data || res.data;
    totalComment.value = responseData?.count ?? res.data?.count ?? 0;
  });
  
  // 检查用户是否已经查看过信件
  const hasReadLetter = uni.getStorageSync('hasReadLetter');
  showNewIcon.value = !hasReadLetter;
});

const goToLetter = () => {
  navigateToPage({
    url: "/original/pages/home/letter"
  });
  
  // 设置用户已查看信件的状态
  uni.setStorageSync('hasReadLetter', true);
  showNewIcon.value = false;
};

const goToUpdate = () => {
  navigateToPage({
    url: "/original/pages/home/update-log"
  });
};
</script>

<style scoped lang="scss">
.tool-box {
  display: flex;
  flex-direction: row;
  .to-users {
    display: flex;
    flex-direction: column;
    margin-left: 5vw;
    .letter-container {
      position: relative;
      width: 48vw;
      height: 18vw;
      .new-badge {
        position: absolute;
        top: -1vw;
        right: -1vw;
        background-color: #ff0000;
        color: #ffffff;
        font-size: 3vw;
        font-weight: bold;
        padding: 1vw 2vw;
        border-radius: var(--app-component-radius, 5vw);
        z-index: 10;
      }
    }
    .tool-card {
      box-sizing: border-box;
      width: 48vw;
      height: 18vw;
      padding: 0 5.8vw;
      position: relative;
      display: flex;
      align-items: center;

      &::before {
        content: "";
        position: absolute;
        top: 2.6vw;
        right: 3.3vw;
        bottom: 3.6vw;
        left: 2.35vw;
        background-color: #ffffff;
        border-radius: var(--app-component-radius, 5vw);
        box-shadow: 0 1vw 2.4vw #0000002b;
      }

      > .card-icon,
      > .card-title,
      > .card-arrow {
        z-index: 1;
      }

      .card-icon {
        flex-shrink: 0;
        position: relative;
        box-sizing: border-box;
        color: #555555;
      }

      .mail-icon {
        width: 4.5vw;
        height: 3.2vw;
        border: 0.32vw solid #555555;
        border-radius: 0.25vw;

        &::before,
        &::after {
          content: "";
          position: absolute;
          top: 0.55vw;
          width: 2.45vw;
          height: 0.32vw;
          background-color: #555555;
        }

        &::before {
          left: 0.05vw;
          transform: rotate(34deg);
          transform-origin: left center;
        }

        &::after {
          right: 0.05vw;
          transform: rotate(-34deg);
          transform-origin: right center;
        }
      }

      .clock-icon {
        width: 4.9vw;
        height: 4.9vw;
        border: 0.38vw solid #555555;
        border-radius: 50%;

        &::before {
          content: "";
          position: absolute;
          left: 1.85vw;
          top: 0.75vw;
          width: 0.36vw;
          height: 1.65vw;
          border-radius: 0.2vw;
          background-color: #555555;
        }

        &::after {
          content: "";
          position: absolute;
          left: 1.85vw;
          top: 2.1vw;
          width: 1.35vw;
          height: 0.36vw;
          border-radius: 0.2vw;
          background-color: #555555;
          transform: rotate(45deg);
          transform-origin: left center;
        }
      }

      .card-title {
        flex: 1;
        margin-left: 1.5vw;
        color: #000000;
        font-size: 3.65vw;
        font-weight: 400;
        line-height: 1;
        white-space: nowrap;
      }

      .card-arrow {
        flex-shrink: 0;
        width: 2.15vw;
        height: 2.15vw;
        margin-left: 1vw;
        border-top: 0.45vw solid #111111;
        border-right: 0.45vw solid #111111;
        transform: rotate(45deg);
      }
    }
  }
  .total-comments {
    margin-top: 2.5vw;
    margin-left: 2.5vw;
    .box {
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
      box-shadow: 2px 2px 16px 0px #0000001f;
      width: 36.5vw;
      height: 30vw;
      border-radius: var(--app-component-radius, 5vw);
      .title {
        display: flex;
        justify-content: center;
        margin-top: 7vw;
        font-weight: 550;
        letter-spacing: 0.1vw;
        font-size: 4vw;
      }
      .number {
        display: flex;
        justify-content: center;
        margin-top: 3vw;
        background: linear-gradient(102.91deg, #f77125 7.67%, #ce1717 112.84%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 5.86vw;
        font-weight: bold;
      }
    }
  }
}
</style>
