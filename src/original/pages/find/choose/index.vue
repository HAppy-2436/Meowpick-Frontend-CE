<template>
  <view class="page-container">
    <scroll @bottom="handleScrollBottom" @scroll="handleScroll">
      <view class="box">
        <view v-if="rows.length > 0">
          <view
            v-for="item in rows"
            :key="item.id"
            class="course-item"
            @click="jump(item.id)"
          >
            <choose-course :data="item" />
          </view>
        </view>
        <view v-else class="empty-state">
          <text class="empty-text">暂无搜索结果</text>
        </view>
      </view>
      <view class="bottom">--- 到底了哟 ---</view>

      <view class="scroll-bottom-spacer" />
    </scroll>
    <top-bar class="top-bar" :selected="0" />
  </view>
</template>
<script setup lang="ts">
import Scroll from '@/original/components/scroll/index.vue';
import TopBar from '@/original/components/top-bar/top-bar.vue';
import { useChoose } from "./index";
import { onLoad } from "@dcloudio/uni-app";
import PubSub from "@/original/config/utils/pubsub";
import ChooseCourse from "@/original/components/choose/choose-course/index.vue";

const { type, keyword, jump, rows, loadMore } = useChoose();
onLoad((options: any) => {
  const decodedKeyword = decodeURIComponent(options.keyword || "");
  keyword.value = decodedKeyword;
  type.value = options.type || "course";
  PubSub.publish("commit_input", decodedKeyword);
});

function handleScrollBottom() {
  loadMore();
}

function handleScroll(e: any) {
  const scrollTop = e.detail?.scrollTop || 0;
  uni.$emit('pageScroll', { scrollTop });
}

</script>
<style scoped lang="scss">
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.box {
  margin-top: 30vw;
  margin-left: 5vw;
  margin-right: 5vw;
}

.course-item {
  margin-bottom: 2vw;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20vw 0;

  .empty-text {
    font-size: 3.5vw;
    color: #999;
  }
}

.bottom {
  margin-left: 37.5vw;
  margin-top: 2.5vw;
  font-size: 3.3vw;
  color: #777777;
}

.scroll-bottom-spacer {
  height: 22vw;
}
</style>
