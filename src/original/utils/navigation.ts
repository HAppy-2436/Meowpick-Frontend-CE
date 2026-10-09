const NAVIGATION_COOLDOWN = 420;
const NAVIGATION_FALLBACK_TIMEOUT = 2000;

let navigationInFlight = false;
let navigationLockedUntil = 0;
let navigationFallbackTimer: ReturnType<typeof setTimeout> | null = null;

type NavigationOptions = {
  url: string;
  success?: (result: any) => void;
  fail?: (error: any) => void;
  complete?: (result: any) => void;
  [key: string]: any;
};

function normalizeOptions(options: string | NavigationOptions): NavigationOptions {
  return typeof options === 'string' ? { url: options } : options;
}

function acquireNavigationLock(): boolean {
  const now = Date.now();
  if (navigationInFlight || now < navigationLockedUntil) return false;
  navigationInFlight = true;
  if (navigationFallbackTimer) clearTimeout(navigationFallbackTimer);
  navigationFallbackTimer = setTimeout(releaseNavigationLock, NAVIGATION_FALLBACK_TIMEOUT);
  return true;
}

function releaseNavigationLock() {
  navigationInFlight = false;
  navigationLockedUntil = Date.now() + NAVIGATION_COOLDOWN;
  if (navigationFallbackTimer) {
    clearTimeout(navigationFallbackTimer);
    navigationFallbackTimer = null;
  }
}

function currentRoute(): string {
  const pages = getCurrentPages();
  const route = pages[pages.length - 1]?.route || '';
  return route.startsWith('/') ? route : `/${route}`;
}

function runNavigation(
  options: NavigationOptions,
  navigate: (options: Record<string, any>) => void,
  extraOptions: Record<string, any> = {}
): boolean {
  if (!acquireNavigationLock()) return false;

  const { success, fail, complete, ...rest } = options;
  try {
    navigate({
      ...rest,
      ...extraOptions,
      success: (result: any) => success?.(result),
      fail: (error: any) => fail?.(error),
      complete: (result: any) => {
        try {
          complete?.(result);
        } finally {
          releaseNavigationLock();
        }
      }
    });
  } catch (error) {
    releaseNavigationLock();
    throw error;
  }
  return true;
}

/** 页面切换不叠加过渡动画，并在实际跳转完成前拦截重复点击。 */
export function navigateToPage(options: string | NavigationOptions): boolean {
  return runNavigation(normalizeOptions(options), next => uni.navigateTo(next as any), {
    animationType: 'none',
    animationDuration: 0
  });
}

export function navigateBackPage(options: Record<string, any> = {}): boolean {
  return runNavigation({ url: '', delta: 1, ...options }, next => uni.navigateBack(next as any), {
    animationType: 'none',
    animationDuration: 0
  });
}

/**
 * 根页面切换使用 reLaunch（皮肤分包内不再使用原生 tabBar），
 * 当前页重复点击和跳转中的连续点击都会被忽略。
 */
export function switchTabPage(options: string | NavigationOptions): boolean {
  const normalized = normalizeOptions(options);
  const targetRoute = normalized.url.split('?')[0];
  if (currentRoute() === targetRoute) return false;
  return runNavigation(normalized, next => uni.reLaunch(next as any));
}

export const navigationMotion = {
  duration: 0
};
