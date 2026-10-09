<template>
  <Layout class="background" @on-bottom="handleBottom">
    <view class="top-bar">
      <view class="go-back" @click="goBack">
        <image src="@/images/go-back.png" class="icon" />
        <view class="txt">{{ course.data.name }}</view>
      </view>
    </view>
    <view class="ellipse" />
    <course-header
      :data="course.data"
      :teachers="teachers"
      class="information"
    />
    <view class="line" />
    <view class="comment-box">
      <view class="comment-title">
        <view class="title-left">
          <image class="icon" src="@/images/comment-icon.png" />
          <view class="title">课程吐槽</view>
        </view>
        <text class="contributor">贡献者：{{ contributor || '/' }}</text>
      </view>

      <CommentList :id="id" :refresh-key="commentsRefreshKey" class="comment-item" />
    </view>
    <view class="comment-button">
      <image
        class="new-box"
        src="../../..//images/comment-button.png"
        @click="jump2comment()"
      />
    </view>
  </Layout>
</template>

<script setup lang="ts">
import { useCourse } from "./useCourse";
import CommentList from "@/original/pages/course/index/CommentList.vue";
import CourseHeader from "@/original/components/course/course-header/index.vue";
import Layout from "@/original/components/layout/index.vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import PubSub from "@/original/config/utils/pubsub";
import { navigateBackPage, navigateToPage } from "@/original/utils/navigation";

let course_id = "";
const commentsRefreshKey = ref(0);
const { fetch, id, course, teachers, trends, contributor } = useCourse();
onLoad((options: any) => {
  course_id = options.id;
});

onShow(() => {
  if (!course_id) return;
  fetch(course_id);
  commentsRefreshKey.value++;
});

function handleBottom() {
  PubSub.publish("comment-next");
}

function jump2comment() {
  navigateToPage({
    url: `/original/pages/course/comment/index?id=${id.value}`
  });
}

function format(time: string) {
  return useTime(parseInt(time));
}

const goBack = () => {
  navigateBackPage({
    delta: 1
  });
};
</script>

<style scoped lang="scss">
.background {
  display: flex;
  flex-direction: column;
}
.top-bar {
  position: fixed;
  top: 0;
  background-color: #b70030;
  width: 100vw;
  height: 26vw;
  z-index: 4;
  .go-back {
    position: absolute;
    top: 15vw;
    left: 5vw;
    width: 100vw;
    display: flex;
    flex-direction: row;
    .txt {
      display: flex;
      align-items: center;
      color: #ffffff;
      max-width: 80vw;
      font-size: 4.8vw;
      margin-left: 2vw;
      margin-top: 0.5vw;
      letter-spacing: 0.2vw;
      font-weight: bold;
      white-space: nowrap;
      overflow: scroll;
      text-overflow: ellipsis;
    }
    .icon {
      display: flex;
      align-items: center;
      width: 5vw;
      height: 8.53vw;
    }
  }
}
.ellipse {
  position: fixed;
  top: 22vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
  z-index: 2;
}
.information {
  position: relative;
  top: 30vw;
}
.line {
  width: 89vw;
  height: 0.3vw;
  background-color: #e9e9e9;
  margin-top: 40vw;
  margin-left: 5vw;
}
.comment-box {
  margin-top: 10vw;
  display: flex;
  flex-direction: column;
  .comment-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5vw;

    .title-left {
      display: flex;
      align-items: center;

      .icon {
        width: 8vw;
        height: 7vw;
      }
      .title {
        font-size: 4.5vw;
        margin-left: 3vw;
        font-weight: bold;
        letter-spacing: 0.3vw;
      }
    }

    .contributor {
      margin-right: 2vw;
      color: #999;
      font-size: 3.2vw;
    }
  }

  .comment-item {
    margin-top: 5vw;
  }
}
.comment-button {
  position: fixed;
  top: 178.4vw;
  left: 74.4vw;
  z-index: 99;
  .new-box {
    width: 20vw;
    height: 20vw;
  }
}
</style>
