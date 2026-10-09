import { showError } from '@/composables/useStatus';

export type SkinType = 'original' | 'new';

/** 各皮肤的根页面路径（original 位于分包，new 位于主包） */
export const SKIN_ENTRY: Record<SkinType, string> = {
  original: '/original/pages/home/home',
  new: '/pages/layout/main'
};

export const SKIN_LABEL: Record<SkinType, string> = {
  original: '原始版',
  new: '定制版'
};

export default defineStore('skin-store', {
  unistorage: true,
  state() {
    return {
      /** 当前生效的皮肤，默认「原始版」（上游 main） */
      current: 'original' as SkinType
    };
  },
  getters: {
    entryRoute(state): string {
      return SKIN_ENTRY[state.current];
    },
    isOriginal: (state) => state.current === 'original'
  },
  actions: {
    setSkin(skin: SkinType) {
      this.current = skin;
    },
    /** 切换皮肤并重启到对应根页面 */
    switchTo(skin: SkinType) {
      this.current = skin;
      uni.reLaunch({
        url: SKIN_ENTRY[skin],
        fail: (err) => {
          console.error('[skin] 切换皮肤失败', skin, err);
          showError('切换失败，请重试');
        }
      });
    }
  }
});
