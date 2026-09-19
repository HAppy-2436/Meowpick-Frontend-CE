import { useTokenStore } from '@/config';

let isInitializing = false;
let loginComplete = false;
let loginPromise: Promise<string | null> | null = null;
let reloginPromise: Promise<string | null> | null = null;
let signInErrorShown = false;

const getBackendEnv = () => uni.getStorageSync('backendEnv') || 'test';

function clearToken() {
  const tokenStore = useTokenStore();
  tokenStore.store('');
  uni.removeStorageSync('token');
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
      // 关键诊断信息：真机上直接弹窗显示，能看到后端拒绝原因
      console.error('[auth] sign_in 失败', {
        statusCode,
        code: body?.code,
        msg: body?.msg,
        body
      });
      if (!signInErrorShown) {
        signInErrorShown = true;
        uni.showModal({
          title: '登录失败',
          content: `HTTP ${statusCode ?? '-'} / code ${body?.code ?? '-'}\n${
            body?.msg || '后端未返回 accessToken'
          }`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
      return null;
    }

    const tokenStore = useTokenStore();
    tokenStore.store(accessToken);
    uni.setStorageSync('token', accessToken);
    if (body.data?.userId) tokenStore.setUserId(body.data.userId);
    return accessToken;
  } catch (err) {
    console.error('[auth] sign_in 请求异常', err);
    return null;
  }
}

export function Init(): Promise<string | null> {
  if (isInitializing && loginPromise) return loginPromise;

  isInitializing = true;
  loginComplete = false;

  const tokenStore = useTokenStore();
  const storedToken = uni.getStorageSync('token') || tokenStore.token;
  if (storedToken) {
    if (!tokenStore.token) {
      tokenStore.store(storedToken);
    }
    loginComplete = true;
    isInitializing = false;
    loginPromise = Promise.resolve(storedToken);
    return loginPromise;
  }

  loginPromise = new Promise((resolve) => {
    uni.login({
      provider: 'weixin',
      success: async (loginRes) => {
        if (!loginRes.code) {
          console.error('[auth] uni.login 未返回 code', loginRes);
          loginComplete = true;
          isInitializing = false;
          resolve(null);
          return;
        }
        const token = await requestSignIn(loginRes.code);
        loginComplete = true;
        isInitializing = false;
        resolve(token);
      },
      fail: (err) => {
        console.error('[auth] uni.login 失败', err);
        loginComplete = true;
        isInitializing = false;
        resolve(null);
      }
    });
  });

  return loginPromise;
}

/**
 * 清除失效 token 并重新登录。用于 401 时自动续期。
 * 并发调用共享同一个登录流程，避免重复 uni.login。
 */
export function relogin(): Promise<string | null> {
  if (reloginPromise) return reloginPromise;
  clearToken();
  loginComplete = false;
  isInitializing = false;
  loginPromise = null;
  reloginPromise = Init().finally(() => {
    reloginPromise = null;
  });
  return reloginPromise;
}

export function waitForLogin(): Promise<void> {
  return new Promise((resolve) => {
    if (loginComplete) {
      resolve();
      return;
    }
    let waited = 0;
    const check = () => {
      if (loginComplete) {
        resolve();
      } else {
        waited += 100;
        if (waited > 30000) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      }
    };
    check();
  });
}
