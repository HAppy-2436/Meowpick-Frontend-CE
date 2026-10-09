<template>
  <view class="background">
    <image src="@/images/cat.png" class="background-image" />
    <view class="letter-list">
      <view
        v-for="(letter, letterIndex) in letters"
        :key="letterIndex"
        class="box"
      >
        <p
          v-for="(paragraph, paragraphIndex) in letter"
          :key="paragraphIndex"
          class="text"
        >
          {{ paragraph }}
        </p>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
onLoad(() => {
  // 当用户访问这封信时，标记为已读
  uni.setStorageSync('hasReadLetter', true);
});

const letters = [
  [
    "选课猫 5.0 和大家见面啦！",
    "这次更新，大家终于可以自己补充选课猫里还没有的课程了。搜索不到某门课时，可以从搜索页或“提案”页发起提案，填写课程名称、开课院系、课程类别、校区和授课教师等信息。",
    "提案不会直接写入课程库。提交后，它会先进入待审核状态，由管理员核对信息；如果部分内容需要调整，管理员会以核实后的信息创建课程。",
    "审核通过后，提案会出现在提案列表中，对应课程也会成为正式课程。点击已通过的提案，就能进入课程页查看或发布吐槽。",
    "如果提案被驳回，可以在“我的提案”中查看原因，修改后重新提交。",
    "提交提案时还可以选择是否公开昵称。选择公开后，课程页会显示贡献者昵称；选择不公开不会影响审核。",
    "每条通过的提案都会根据所填信息的正确率结算贡献值。贡献值越高，每天可以提交的提案数量也会提高。",
    "遇到问题或有新的想法，欢迎加入选课猫官方反馈QQ群：344213052。",
    "选课猫团队 2026年9月11日"
  ],
  [
    "全新版的 选课猫 终于和大家见面啦！",
    "原开发团队的朋友们大多已经毕业或升学，因此选课猫曾有一段时间陷入无人维护的状态。",
    "在 2025 年暑假，我们新团队正式接过选课猫的维护与重构任务。",
    "",
    "也许大家暂时不会觉得新版有太多变化，这是因为我们暂未增加新功能。",
    "但事实上，我们已经彻底重构了选课猫的整体后端架构，让系统更加稳定流畅。",
    "今后在选课高峰期，也不再那么容易出现崩溃的情况啦！",
    "",
    "未来，我们还计划逐步推出更多功能，",
    "包括大家期待已久的「新增课程和老师」功能等。",
    "感谢大家一直以来对选课猫的喜爱与支持 ❤",
    "欢迎加入选课猫官方反馈QQ群：344213052，期待您的建议与反馈",
    "选课猫团队 2025年10月13日"
  ]
];
</script>

<style scoped lang="scss">
.background {
  position: relative;
  .background-image {
    position: fixed;
    width: 70vw;
    height: 105vw;
    left: 25vw;
    top: 10vw;
    z-index: 0;
  }
  .letter-list {
    position: relative;
    z-index: 1;
    width: 96vw;
    margin-left: 2vw;
    padding-top: 5vw;

    .box {
      width: 96vw;
      height: auto;
      margin-bottom: 5vw;
      padding: 5vw;
      background: #ffffff;
      box-shadow: 1vw 1vw 6vw 3vw #0000001f;
      opacity: 0.8;
      display: flex;
      flex-direction: column;
      border-radius: var(--app-component-radius, 5vw);
      word-wrap: break-word; /* 允许长单词或URL地址换行 */
      overflow-wrap: break-word; /* 允许在单词内部换行以避免溢出 */
      .title {
        display: flex;
        font-weight: bold;
        justify-content: center;
      }
      .text {
        white-space: pre-wrap;
        margin-top: 2vw;
        font-size: 4vw;
      }
    }
  }
}
</style>
