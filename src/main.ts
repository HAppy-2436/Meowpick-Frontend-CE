import { createSSRApp } from 'vue';
import App from './App.vue';
import * as Pinia from 'pinia';
import { createUnistorage } from 'pinia-plugin-unistorage';
import { syncNativeTheme } from './utils/native-theme';
import {
  initNetworkWatcher,
  installBackendToastGuard
} from './utils/backend-status';
import { retryLoginOnReconnect } from './utils/init';

import './main.scss';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = Pinia.createPinia();
  pinia.use(createUnistorage());
  app.use(pinia);
  // 后端不可用时把失败类 toast 统一改写为「点首页 Hello 刷新登录」
  installBackendToastGuard();
  // 监听本地网络状态，断网时可即时提示（不等请求超时）；网络恢复时自动补登录
  initNetworkWatcher(retryLoginOnReconnect);
  // 每个页面 onLoad / onShow 时重设原生背景色：页面转场动画使用微信
  // 原生 backgroundColor，仅靠 onLaunch 设置会在跳转新页面时回退成浅色
  app.mixin({
    onLoad() {
      syncNativeTheme();
    },
    onShow() {
      syncNativeTheme();
    }
  });

  return {
    app,
    Pinia
  };
}
