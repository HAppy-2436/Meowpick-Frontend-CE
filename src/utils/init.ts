import { useTokenStore } from '@/config';
import {
  isOffline,
  markBackendUp,
  showBackendGuide
} from '@/utils/backend-status';

/**
 * 登录流程状态。
 *
 * loginPromise：当前这次登录尝试（首次登录或重登）。它**一定会 settle**
 *   （内部带超时兜底），因此 waitForLogin 不会再无限轮询。
 * reloginPromise：重登去重，避免并发 401 触发多次 uni.login。
 * lastReloginAt：重登冷却时间戳，避免短时间内反复登录形成"重登风暴"。
 */
let loginPromise: Promise<string | null> | null = null;
let reloginPromise: Promise<string | null> | null = null;
let lastReloginAt = 0;

/** 单次登录最长等待时间，超过则按失败处理，避免整个 app 卡在登录上 */
const LOGIN_TIMEOUT_MS = 12000;
/** 两次（自动）重登之间的最小间隔，冷却期内直接复用现有 token */
const RELOGIN_COOLDOWN_MS = 8000;

const getBackendEnv = () => uni.getStorageSync('backendEnv') || 'test';

function clearToken() {
  const tokenStore = useTokenStore();
  tokenStore.store('');
  uni.removeStorageSync('token');
}

function readStoredToken(): string {
  const tokenStore = useTokenStore();
  return uni.getStorageSync('token') || tokenStore.token || '';
}

/**
 * 给一个 Promise 加超时兜底：无论原任务是否回调，最多等待 ms 后返回 null。
 * 用于 uni.login / uni.request 在异常环境下不触发回调的场景。
 */
function withTimeout<T>(
  task: Promise<T>,
  ms: number,
  onTimeout?: () => void
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    let settled = false;
    const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
      if (settled) return;
      settled = true;
      console.warn(`[auth] 操作超过 ${ms}ms 未完成，按失败处理`);
      onTimeout?.();
      resolve(null);
    }, ms);
    const finish = (value: T | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    task.then(finish).catch(() => {
      finish(null);
    });
  });
}

/**
 * 登录最终失败（拿不到 token）时提示用户手动恢复。
 *
 * 此时 loginPromise 会缓存失败结果，自动流程不会重试；首页点击
 * 「Hello,」触发的 relogin(true) 是唯一能强制重新登录的入口。
 * 具体失败原因只进日志，toast 统一由 backend-status 引导。
 */
function notifyLoginFailed(detail?: string) {
  showBackendGuide(detail);
}

async function requestSignIn(code: string): Promise<string | null> {
  try {
    const res = await uni.request({
      url: import.meta.env.VITE_SERVER_HOST_PORT + '/api/auth/sign_in',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Xh-Env': getBackendEnv()
      },
      data: {
        authType: 'wechat',
        authId: 'miniapp_user',
        verifyCode: code
      }
    });

    const statusCode = (res as { statusCode?: number }).statusCode;
    const body = res.data as {
      code?: number;
      msg?: string;
      data?: { accessToken?: string; userId?: string; isAdmin?: boolean };
    };
    const accessToken = body?.data?.accessToken;

    if (statusCode !== 200 || body?.code !== 0 || !accessToken) {
      // 关键诊断信息：真机上直接弹窗显示，能看到后端拒绝原因。
      // 注意：不要整体打印 body，其中可能包含 accessToken（凭据泄漏）。
      console.error('[auth] sign_in 失败', {
        statusCode,
        code: body?.code,
        msg: body?.msg
      });
      notifyLoginFailed(
        `HTTP ${statusCode ?? '-'} / code ${body?.code ?? '-'}${
          body?.msg ? ' / ' + body.msg : ''
        }`
      );
      return null;
    }

    const tokenStore = useTokenStore();
    tokenStore.store(accessToken);
    uni.setStorageSync('token', accessToken);
    if (body.data?.userId) tokenStore.setUserId(body.data.userId);
    markBackendUp();
    return accessToken;
  } catch (err) {
    console.error('[auth] sign_in 请求异常', err);
    notifyLoginFailed('登录接口请求异常');
    return null;
  }
}

function startLogin(): Promise<string | null> {
  // 本地断网时立刻引导，不等登录超时
  if (isOffline()) showBackendGuide('设备离线');

  return withTimeout(
    new Promise<string | null>((resolve) => {
      uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
          if (!loginRes.code) {
            console.error('[auth] uni.login 未返回 code', loginRes);
            notifyLoginFailed('微信登录未返回 code');
            resolve(null);
            return;
          }
          resolve(await requestSignIn(loginRes.code));
        },
        fail: (err) => {
          console.error('[auth] uni.login 失败', err);
          notifyLoginFailed('微信登录失败');
          resolve(null);
        }
      });
    }),
    LOGIN_TIMEOUT_MS,
    () => {
      notifyLoginFailed('登录超时');
    }
  );
}

export function Init(): Promise<string | null> {
  if (loginPromise) return loginPromise;

  const storedToken = readStoredToken();
  if (storedToken) {
    const tokenStore = useTokenStore();
    if (!tokenStore.token) tokenStore.store(storedToken);
    loginPromise = Promise.resolve(storedToken);
    return loginPromise;
  }

  loginPromise = startLogin();
  return loginPromise;
}

/**
 * 清除失效 token 并重新登录。用于 401 / 2xxxx 自动续期。
 *
 * @param force 手动触发时传 true，跳过冷却（首页"点击 Hello 重新登录"）。
 *              自动续期保持默认，冷却期内直接复用现有 token，避免重登风暴。
 */
export function relogin(force = false): Promise<string | null> {
  if (reloginPromise) return reloginPromise;

  const now = Date.now();
  if (!force && now - lastReloginAt < RELOGIN_COOLDOWN_MS) {
    return Promise.resolve(readStoredToken() || null);
  }
  lastReloginAt = now;

  clearToken();
  loginPromise = null;
  reloginPromise = Init().finally(() => {
    reloginPromise = null;
  });
  return reloginPromise;
}

/**
 * 网络恢复时尝试自愈登录：仅在本地无 token（此前自动登录未成功）时触发；
 * 已有 token 时交由请求 401 自动续期，避免不必要的重登。
 */
export function retryLoginOnReconnect() {
  if (readStoredToken()) return;
  relogin().catch(() => {
    // 仍失败：保留常驻引导，等待用户点首页 Hello 手动重登
  });
}

/**
 * 等待当前登录流程结束。
 *
 * 不再轮询：直接复用 loginPromise，它带超时兜底，必然 settle，
 * 所以即使登录失败，调用方也会在有限时间内继续，而不是挂满 30 秒。
 */
export function waitForLogin(): Promise<void> {
  const pending = loginPromise ?? Init();
  return pending.then(
    () => undefined,
    () => undefined
  );
}
