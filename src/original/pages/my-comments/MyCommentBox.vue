<template>
  <view class="my-comment-box">
    <view class="comment-box">
      <view class="title">
        <view class="name">{{ props.data.name }}</view>
        <view class="dept-name">{{ props.data.category }}</view>
      </view>
      <view class="information">
        <view class="circle" />
        <view class="department">{{ props.data.department }}</view>
        <view class="circle" />
        <view
          v-for="item of props.data.teachers"
          :key="formatTeacherName(item)"
          class="instructor"
        >
          {{ formatTeacherName(item) }}
        </view>
      </view>
      <view class="tag">
        <view v-for="item of limitedTags(props.data.tags!)" class="item">
          <image :src="Emoji(item)" class="emoji" />
          <text class="tag-txt">{{ item }}</text>
        </view>
      </view>
      <view class="time">{{ format(props.data.createdAt) }}</view>
      <view class="content">{{ props.data.content }}</view>
      <view class="comment-actions">
        <view class="delete-action" @tap.stop="remove">
          <text>删除</text>
        </view>
        <view class="like">
          <image
            :src="props.data.like ? Liked : Like"
            class="like-icon"
            @tap.stop="like"
          />
          <view class="like-num">{{ props.data.likeCnt }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DtoCommentVO } from "@/original/api/data-contracts";
import { Emoji, limitedTags } from "@/original/utils/tags";
import Liked from "@/images/like_active.png";
import Like from "@/images/like-icon.png";
import { formatTeacherName } from "@/original/utils/teacher";

type Props = {
  data: DtoCommentVO;
};
const props = defineProps<Props>();

const emit = defineEmits<{
  like: (id: string) => void;
  delete: (id: string) => void;
}>();

function like() {
  emit("like", props.data.id);
}

function remove() {
  emit("delete", props.data.id);
}

function format(timeStamp: string): string {
  const date = new Date(timeStamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}
</script>

<style scoped lang="scss">
.my-comment-box {
  background-color: #b70030;
  width: 89vw;
  height: auto;
  margin-top: 5vw;
  border-radius: var(--app-component-radius, 5vw);
  .comment-box {
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    width: 87vw;
    height: auto;
    margin-left: 1vw;
    border-radius: var(--app-component-radius, 5vw);
    box-shadow: 1px 1px 5px 0px #0000001f;
    .title {
      display: flex;
      flex-direction: row;
      .name {
        margin-left: 4vw;
        margin-top: 4vw;
        font-size: 4vw;
        font-weight: bold;
      }
      .dept-name {
        margin-left: 2.5vw;
        margin-top: 4.5vw;
        font-size: 3.2vw;
        color: #545454;
      }
    }
    .information {
      display: flex;
      flex-direction: row;
      margin-top: 3vw;
      .circle {
        width: 2vw;
        height: 2vw;
        border-radius: 50%;
        background-color: #b70030;
        margin-left: 4vw;
        margin-top: 1.5vw;
      }
      .department {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
      .instructor {
        margin-left: 1.5vw;
        font-size: 3.5vw;
      }
    }
    .tag {
      display: flex;
      flex-wrap: wrap;
      margin-top: 3vw;

      .item {
        background: #f1f1f1;
        display: flex;
        flex-direction: row;
        padding: 1vw;
        border-radius: var(--app-component-radius, 5vw);
        margin-left: 2vw;

        .emoji {
          width: 6.4vw;
          height: 6.4vw;
        }

        .tag-txt {
          margin-top: 1vw;
          margin-left: 1vw;
          font-size: 3.8vw;
        }
      }
    }
    .time {
      margin-left: 65vw;
      font-size: 3.5vw;
    }
    .content {
      margin-top: 3vw;
      width: 82.93vw;
      margin-left: 3.5vw;
      letter-spacing: 0.3vw;
      line-height: 1.5;
      font-size: 3.9vw;
    }
    .comment-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4vw;
      padding: 2vw 4vw 3vw;

      .delete-action {
        padding: 1.4vw 3vw;
        color: #b70030;
        background-color: #fff1f4;
        border-radius: var(--app-component-radius, 5vw);
        font-size: 3.3vw;
        line-height: 1;
      }
    }
    .like {
      display: flex;
      flex-direction: row;
      align-items: center;
      .like-icon {
        width: 5.86vw;
        height: 5.86vw;
      }
      .like-num {
        margin-left: 2vw;
        font-size: 3.8vw;
      }
    }
  }
}
</style>
