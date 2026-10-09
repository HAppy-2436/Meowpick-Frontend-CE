import { ref, watch, type Ref } from 'vue';
import type { DtoSearchSuggestionsVO } from '@/api/data-contracts';
import { http } from '@/config';

export const useInput = () => {
  const searchText = ref('');
  const placeHolder = ref('搜索课程、老师');

  return {
    searchText,
    placeHolder
  };
};

export function useSuggest(externalKeyword?: Ref<string>) {
  const internalKeyword = ref('');
  const keyword = externalKeyword || internalKeyword;
  const type = ref('course');
  const suggestList = ref<(DtoSearchSuggestionsVO & { id?: string })[]>([]);
  const isLoading = ref(false);

  // 请求序号：慢响应返回时丢弃，避免旧建议覆盖新输入
  let requestVersion = 0;

  function suggestContent() {
    if (!keyword.value) {
      suggestList.value = [];
      isLoading.value = false;
      return;
    }

    const requestKeyword = keyword.value;
    const version = ++requestVersion;
    isLoading.value = true;
    http.SearchController.searchSuggestList({ keyword: requestKeyword })
      .then((res) => {
        if (version !== requestVersion) return; // 过期响应丢弃
        const suggestions = res.data?.data?.suggestions ?? [];

        // 过滤掉与输入完全相同的项，避免重复
        suggestList.value = suggestions
          .filter((item) => item.name !== requestKeyword)
          .map((item) => ({
            name: item.name,
            type: item.type,
            id: `${String(item.type)}-${String(item.name)}`
          }));
      })
      .catch((err: unknown) => {
        if (version !== requestVersion) return;
        console.error('[useSuggest] error:', err);
        suggestList.value = [];
      })
      .finally(() => {
        if (version === requestVersion) isLoading.value = false;
      });
  }

  watch([keyword, type], () => {
    suggestList.value = [];
    isLoading.value = false;
  });

  return {
    keyword,
    suggestList,
    suggestContent,
    isLoading
  };
}
