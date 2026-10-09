<template>
  <view class="top-bar">
    <view class="go-back" @click="goBack">
      <image src="@/images/go-back.png" class="icon" />
      <view class="txt">{{ course.data.name }}</view>
    </view>
  </view>
  <view class="ellipse" />
  <view class="title">
    <image src="@/images/comment-icon.png" class="icon" />
    <text class="tip">课程吐槽</text>
  </view>
  <view class="add-tag">
    <view class="tag-title">
      <image src="@/original/images/addTag-icon.png" class="icon" />
      <text class="tip">添加标签</text>
    </view>
    <view class="tag-box">
      <view class="box-title">
        <image src="@/original/images/choose-icon.png" class="icon" />
        <text class="tip">可选择</text>
      </view>
      <view class="chosen-box">
        <view
          v-for="item of TotalTags"
          :key="item.text"
          class="tag-item"
          :style="{ backgroundColor: item.isSelected ? '#D3D3D3' : '#f1f1f1' }"
          @click="toggleTag(item.text)"
        >
          <image :src="item.icon" class="emoji" />
          <text class="tag-txt">{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
  <view class="add-comment">
    <view class="comment-title">
      <image src="@/original/images/addTag-icon.png" class="icon" />
      <text class="tip">添加吐槽</text>
    </view>
    <view class="comment-box">
      <textarea
        v-model="text"
        placeholder="请客观评价，不得发表涉及广告、时政、色情、辱骂、违法犯罪、欺诈等违规内容"
        class="content-text"
      />
    </view>
  </view>
  <view class="comment-button" @click="commit" :disabled="isClicked">
    <text class="content">吐槽</text>
  </view>
</template>
<script setup lang="ts">
import { http } from '@/original/config';
import { useCourse } from "@/original/pages/course/index/useCourse";
import { Tags, TotalTags, InitTags } from "@/original/utils/tags";
import { Ref } from "vue";
import { navigateBackPage } from "@/original/utils/navigation";
import { getContentReviewError } from "@/original/utils/contentReview";

type Props = {};
const props = defineProps<Props>();

let course_id = "";
const { fetch, id, course, teachers, trends } = useCourse();
const text = ref("");
const tags = ref<string[]>([]);
const SelectedTags = ref<Tags[]>([]);
const isClicked = ref(false);
onLoad((options: any) => {
  course_id = options.id;
  fetch(course_id);
});
onMounted(() => {
  InitTags();
});
const goBack = () => {
  navigateBackPage({
    delta: 1
  });
};
function toggleTag(text: string) {
  const tag = TotalTags.value.find(item => item.text === text);
  if (!tag) return;

  if (tag.isSelected) {
    tag.isSelected = false;
    SelectedTags.value = SelectedTags.value.filter(
      selectedTag => selectedTag.text !== text
    );
    tags.value = tags.value.filter(tagText => tagText !== text);
    return;
  }

  if (SelectedTags.value.length >= 4) {
    uni.showToast({
      title: "最多添加4个",
      icon: "none"
    });
    return;
  }

  tag.isSelected = true;
  SelectedTags.value.push(tag);
  tags.value.push(tag.text);
}

const commit = async () => {
  if (isClicked.value) return; //防重复提交
  const content = text.value.trim();
  if (!content) { //验证内容是否为空
    uni.showToast({
      title: "未填写吐槽",
      duration: 2000,
      icon: "none"
    });
    return;
  }
  if (Array.from(content).length > 140) {
    uni.showToast({
      title: "吐槽内容不能超过140个字符",
      duration: 3000,
      icon: "none"
    });
    return;
  }

  isClicked.value = true;
  try { //提交评价
    console.log(id.value, {
      text: text.value,
      tags: tags.value
    });

    // 修改请求参数结构以匹配新的后端接口
    const res = await http.CommentController.commentAddCreate({
      courseId: id.value,  // 将 target 改为 courseId
      content,
      tags: tags.value
    });

    const errorMessage = getContentReviewError(res.data, 'comment', '吐槽发布失败，请稍后重试');
    if (errorMessage) {
      uni.showToast({ title: errorMessage, icon: 'none', duration: 3500 });
      return;
    }

    navigateBackPage({ //提交成功后返回课程详情界面
      delta: 1
    });
  } catch (error) {
    console.error(error);
    uni.showToast({ title: '网络异常，已保留填写内容，请稍后重试', icon: 'none', duration: 3500 });
  } finally {
    isClicked.value = false;
  }
};
</script>

<style scoped lang="scss">
.ellipse {
  position: absolute;
  top: 22vw;
  background-color: #b70030;
  width: 100vw;
  height: 8vw;
  border-radius: 50%;
}
.title {
  position: absolute;
  top: 35vw;
  left: 30vw;
  font-size: 5.86vw;
  display: flex;
  flex-direction: row;
  .icon {
    width: 8vw;
    height: 7vw;
    margin-top: 1vw;
  }
  .tip {
    font-weight: bold;
    letter-spacing: 0.3vw;
    margin-left: 2vw;
  }
}
.add-tag {
  position: absolute;
  top: 45vw;
  .tag-title {
    margin-top: 8vw;
    margin-left: 5vw;
    display: flex;
    flex-direction: row;
    .icon {
      width: 5.5vw;
      height: 5.5vw;
      margin-top: 0.6vw;
    }
    .tip {
      font-size: 4.8vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
      margin-left: 2vw;
    }
  }
  .tag-box {
    border-style: dashed; /* 设置边框样式为虚线 */
    border-color: #de3b3b; /* 设置边框颜色 */
    border-width: 2px; /* 设置边框宽度 */
    border-radius: var(--app-component-radius, 5vw);
    width: 89.33vw;
    height: auto;
    margin-left: 5vw;
    margin-top: 4vw;
    padding-bottom: 4vw;
    .box-title {
      margin-top: 4vw;
      margin-left: 3vw;
      .icon {
        width: 5vw;
        height: 5vw;
      }
      .tip {
        font-size: 4.2vw;
        letter-spacing: 0.3vw;
        margin-left: 2vw;
      }
    }
    .chosen-box {
      display: flex;
      flex-wrap: wrap;
      width: 85vw;
      margin-left: 3vw;
      .tag-item {
        background: #f1f1f1;
        display: flex;
        flex-direction: row;
        padding: 1vw;
        border-radius: var(--app-component-radius, 5vw);
        width: 18vw;
        margin-left: 2vw;
        margin-top: 2vw;
        .emoji {
          width: 6.4vw;
          height: 6.4vw;
        }
        .tag-txt {
          margin-top: 1vw;
          margin-left: 1vw;
          font-size: 4vw;
          white-space: nowrap;
        }
      }
    }
  }
}
.add-comment {
  position: absolute;
  top: 100vw;

  .comment-title {
    margin-top: 5vw;
    margin-left: 5vw;
    display: flex;
    flex-direction: row;
    .icon {
      width: 5.5vw;
      height: 5.5vw;
      margin-top: 0.6vw;
    }
    .tip {
      font-size: 4.8vw;
      font-weight: bold;
      letter-spacing: 0.3vw;
      margin-left: 2vw;
    }
  }
  .comment-box {
    border: 0.5vw solid;
    border-color: #de3b3b; /* 设置边框颜色 */
    border-width: 2px; /* 设置边框宽度 */
    border-radius: var(--app-component-radius, 5vw);
    width: 89.33vw;
    height: 35vw;
    margin-left: 5vw;
    margin-top: 4vw;
    .content-text {
      display: block;
      width: 95%; /* 输入框宽度占满父元素宽度 */
      height: 90%;
      padding: 3vw;
      text-align: left;
      font-size: 4vw;
    }
  }
}
.comment-button {
  position: absolute;
  top: 155vw;
  left: 27vw;
  background-color: #b70030;
  box-shadow: 4px 4px 16px 0px #00000026;
  width: 42.1vw;
  height: 12.26vw;
  border-radius: var(--app-component-radius, 5vw);
  display: flex;
  justify-content: center;
  align-items: center;
  .content {
    color: #ffffff;
    font-size: 5vw;
    letter-spacing: 0.3vw;
    font-weight: bold;
  }
}
</style>
