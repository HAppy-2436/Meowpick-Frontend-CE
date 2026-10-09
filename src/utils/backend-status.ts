/**
 * 后端可用性状态 + toast 统一引导。
 *
 * 场景：连不上后端 / 登录拿不到 token 时，点任何按钮都会各自弹
 * 「加载失败」「删除失败」「request:fail」等五花八门的提示。这里集中判定
 * 「后端是否不可用」，并拦截 showToast，把失败类文案统一改写成
 * 「点首页 Hello 刷新登录」，避免用户一脸茫然。
 *
 * 任意一次请求成功（或重登成功）即视为后端恢复，自动解除改写。
 */
import { reactive } from 'vue';

/**
 * 统一引导文案：首页 Hello 是手动强制重登入口。
 * 刻意简短，并用空格把 Hello 与中文隔开，避免原生 toast 折行时把 Hello 拆断。
 */
export const BACKEND_GUIDE_TITLE = '点首页 Hello 刷新登录';

/**
 * 常驻引导的显隐状态。
 *
 * 与 useStatus 的「状态弹窗」相互独立：状态弹窗是瞬态的，会互相顶替；
 * 而登录失效引导需要**一直显示到重新登录成功**，因此单独用一层，
 * 由 MwpStatusOverlay 渲染（无遮罩、不阻断交互）。
 */
export const guideState = reactive({ visible: false });

const showGuide = () => {
  guideState.visible = true;
};

const hideGuide = () => {
  guideState.visible = false;
};

/**
 * 失败类文案识别：命中才改写，避免误伤「已保存」「昵称不能为空」等提示。
 * 只保留明确的失败信号词，不做宽泛动词匹配。
 */
const FAILURE_PATTERN =
  /失败|错误|异常|超时|无网络|网络异常|断网|请求异常|fail|error|timeout|abort|denied|unauthor|network/i;

let backendDown = false;

/** 后端是否处于不可用状态 */
export const isBackendDown = () => backendDown;

/** 标记后端不可用（请求失败 / 重登失败时调用） */
export const markBackendDown = () => {
  backendDown = true;
};

/** 标记后端已恢复（任意请求成功时调用） */
export const markBackendUp = () => {
  backendDown = false;
  // 后端恢复：收起常驻的登录引导
  hideGuide();
};

/** 网络是否在线（本地网络状态，与后端是否可达无关） */
let networkOnline = true;

/** 离线判断：用于在请求真正超时前就给出即时反馈 */
export const isOffline = () => !networkOnline;

/**
 * 启动网络状态监听：本地断网时无需等请求超时即可即时提示。
 * 在 app 创建时调用一次即可。
 *
 * @param onReconnect 网络恢复时的回调（用于自动重试登录自愈）
 */
let networkWatcherInstalled = false;
export function initNetworkWatcher(onReconnect?: () => void) {
  if (networkWatcherInstalled) return;
  networkWatcherInstalled = true;

  uni.getNetworkType({
    success: (res) => {
      networkOnline = res.networkType !== 'none';
    }
  });
  uni.onNetworkStatusChange((res) => {
    const wasOffline = !networkOnline;
    networkOnline = res.isConnected;
    // 断网 → 恢复：尝试自动补登录，尽量自愈而不打扰用户
    if (res.isConnected && wasOffline) onReconnect?.();
  });
}

/**
 * 显示常驻的「点首页 Hello 刷新登录」引导（不改变后端可用性判定）。
 * 独立于瞬态状态弹窗，重新登录成功 / 后端恢复前不会消失。
 */
export function showGuideToast() {
  showGuide();
}

/**
 * 失败文案统一处理，供自定义状态弹窗复用（保持与 showToast 拦截器一致的语义）：
 * - 后端可用：原样返回；
 * - 后端不可用且命中失败信号：显示常驻引导并返回 null（丢弃瞬态 toast，避免重复刷屏）。
 */
export function resolveFailureTitle(title: string): string | null {
  if (!backendDown) return title;
  if (!FAILURE_PATTERN.test(title)) return title;

  showGuide();
  return null;
}

/**
 * 请求失败 / 连不上后端时：标记后端不可用并显示引导。
 */
export function showBackendGuide(detail?: string) {
  markBackendDown();

  if (detail) console.warn('[backend] 请求失败：', detail);

  showGuideToast();
}

/**
 * 安装 showToast 拦截器：后端不可用时，把失败类 toast 统一改写为引导。
 * 幂等，重复调用只注册一次。
 */
let guardInstalled = false;
export function installBackendToastGuard() {
  if (guardInstalled) return;
  guardInstalled = true;

  uni.addInterceptor('showToast', {
    invoke(args: { title?: string; icon?: string; duration?: number }) {
      if (!args?.title) return;

      const resolved = resolveFailureTitle(args.title);
      if (resolved === null) return false;
      if (resolved === args.title) return;

      args.title = resolved;
      args.icon = 'none';
      args.duration = 3000;
    }
  });
}
