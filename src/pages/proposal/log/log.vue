<template>
  <view class="log-page" :class="themeStore.themeClass">
    <TopNavBar title="操作记录" :subtitle="`${logs.length} 条记录`" />
    <view :style="{ height: navBarHeight + 'px' }"></view>

    <scroll-view scroll-y class="log-scroll" enhanced :show-scrollbar="false" @scrolltolower="loadMore">
      <ProposalLogTimeline
        :logs="logs"
        :loading="loading && logs.length === 0"
        :error="error"
        :no-more="noMore"
        @retry="reload"
        @proposal-click="goToProposal"
      />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { http, useThemeStore } from '@/config';
import { useMenuButton } from '@/composables/useMenuButton';
import TopNavBar from '@/components/common/TopNavBar.vue';
import ProposalLogTimeline from '@/components/proposal/ProposalLogTimeline.vue';
import type { DtoProposalTimelineLogVO } from '@/api/data-contracts';

const themeStore = useThemeStore();
const { navBarHeight } = useMenuButton();

const logs = ref<DtoProposalTimelineLogVO[]>([]);
const loading = ref(false);
const error = ref(false);
const noMore = ref(false);
const page = ref(1);

const fetchLogs = async (p = 1) => {
  if (loading.value && p > 1) return;
  loading.value = true;
  error.value = false;
  try {
    const res: any = await http.ChangeLogController.changelogProposalTimelineList({}, { page: p, pageSize: 20 });
    const data = res.data?.data;
    const list = (data?.logs ?? data?.data?.logs ?? []) as DtoProposalTimelineLogVO[];
    if (p === 1) logs.value = list;
    else logs.value = [...logs.value, ...list];
    const total = data?.total ?? logs.value.length;
    noMore.value = logs.value.length >= total;
    page.value = p;
  } catch {
    if (p === 1) error.value = true;
  } finally {
    loading.value = false;
  }
};

const reload = () => fetchLogs(1);
const loadMore = () => {
  if (!noMore.value && !loading.value) fetchLogs(page.value + 1);
};

const goToProposal = (id?: string) => {
  if (!id) return;
  uni.navigateTo({ url: `/pages/course/proposal-detail/index?id=${id}` });
};

const goBack = () => uni.navigateBack();

onLoad(() => { reload(); });
</script>

<style lang="scss" scoped src="./_style.scss" />
