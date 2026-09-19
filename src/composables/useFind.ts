import { ref, watch, type Ref } from 'vue';
import type { DtoSearchSuggestionsVO } from '@/api/data-contracts';
import { http } from '@/config';

export const useInput = () => {
  const searchText = ref('');
  const placeHolder = ref('搜索课程、老师或吐槽...');

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function suggestContent(_pageNum?: number) {
    if (!keyword.value) {
      suggestList.value = [];
      return;
    }

    http.SearchController.searchSuggestList({ keyword: keyword.value })
      .then((res) => {
        const suggestions = res.data?.data?.suggestions ?? [];

        // 始终将输入内容作为第一条
        const inputItem = {
          name: keyword.value,
          type: 'input',
          id: `input-${keyword.value}`
        };

        // 过滤掉与输入完全相同的项，避免重复
        const filteredSuggestions = suggestions
          .filter((item) => item.name !== keyword.value)
          .map((item) => ({
            name: item.name,
            type: item.type,
            id: `${String(item.type)}-${String(item.name)}`
          }));

        // 合并：输入内容 + 过滤后的建议
        suggestList.value = [inputItem, ...filteredSuggestions];
      })
      .catch((err: unknown) => {
        console.error('[useSuggest] error:', err);
        // 即使出错，也应该显示输入内容作为第一条
        suggestList.value = [
          {
            name: keyword.value,
            type: 'input',
            id: `input-${keyword.value}`
          }
        ];
      });
  }

  watch([keyword, type], () => {
    suggestList.value = [];
  });

  return {
    keyword,
    type,
    suggestList,
    suggestContent
  };
}
