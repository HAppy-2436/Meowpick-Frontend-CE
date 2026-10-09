import { Course } from '@/api/Course';
import { Courses } from '@/api/Courses';
import { Search } from '@/api/Search';
import { Comment } from '@/api/Comment';
import { Like } from '@/api/Like';
import { Proposal } from '@/api/Proposal';
import { Teacher } from '@/api/Teacher';
import { Auth } from '@/api/Auth';
import { User } from '@/api/User';
import { ChangeLog } from '@/api/ChangeLog';
import { waitForLogin, relogin } from '@/utils/init';
import {
  isBackendDown,
  isOffline,
  markBackendUp,
  showBackendGuide
} from '@/utils/backend-status';
import { useTokenStore } from '@/config';
import { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';

const buildQueryString = (params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return '';
  const parts: string[] = [];
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null) return;
    // 数组按「重复 query 参数」序列化（后端支持重复参数 / JSON 字符串两种形式）
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) {
          parts.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`
          );
        }
      });
      return;
    }
    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );
  });
  return parts.join('&');
};

const logRequestError = (context: string, error: any, config?: any) => {
  console.error(`[HTTP Error] ${context}`, {
    message: error?.message || 'Unknown error',
    path: config?.url || config?.path || 'N/A',
    method: config?.method || 'N/A',
    status: error?.response?.status || 'N/A',
    statusText: error?.response?.statusText || error?.errMsg || 'N/A',
    timestamp: new Date().toISOString()
  });
};

const uniRequestAdapter: AxiosAdapter = async (
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  await waitForLogin();

  const {
    baseURL = '',
    url = '',
    method = 'GET',
    headers = {},
    data,
    params
  } = config;

  let fullUrl = baseURL + url;
  const queryString = buildQueryString(params as Record<string, any>);
  if (queryString) {
    fullUrl += '?' + queryString;
  }

  const backendEnv = uni.getStorageSync('backendEnv') || 'test';
  const tokenHeader = import.meta.env.VITE_TOKEN_NAME || 'Authorization';

  const send = (token: string, attempt: number): Promise<AxiosResponse> =>
    new Promise((resolve, reject) => {
      const uniConfig: any = {
        url: fullUrl,
        method: method,
        header: {
          ...headers,
          ...(token ? { [tokenHeader]: `Bearer ${token}` } : {}),
          'X-Xh-Env': backendEnv
        },
        timeout: 30000,
        success: async (res: any) => {
          if (
            res.statusCode === 0 ||
            (res.errMsg && res.errMsg.includes('fail'))
          ) {
            const error = new Error(
              res.errMsg || 'Network request failed'
            ) as Error & { response?: unknown };
            error.response = {
              data: res.data,
              status: res.statusCode,
              statusText: res.errMsg,
              headers: res.header || {},
              config: config,
              request: null
            };
            logRequestError('Request failed', error, config);
            showBackendGuide(res.errMsg || '');
            reject(error);
            return;
          }

          // token 失效/过期：HTTP 401，或 200 + 业务错误码 2xxxx
          const bizCode =
            res.data && typeof res.data === 'object'
              ? (res.data as { code?: number }).code
              : undefined;
          const authFailed =
            res.statusCode === 401 ||
            bizCode === 100000001 ||
            (typeof bizCode === 'number' &&
              bizCode >= 20000 &&
              bizCode < 30000);
          if (authFailed) {
            if (attempt === 0) {
              const newToken = await relogin();
              if (newToken) {
                send(newToken, attempt + 1).then(resolve, reject);
                return;
              }
            }
            const error = new Error('Unauthorized') as Error & {
              response?: unknown;
            };
            error.response = {
              data: res.data,
              status: res.statusCode,
              statusText: 'Unauthorized',
              headers: res.header || {},
              config: config,
              request: null
            };
            logRequestError('Unauthorized', error, config);
            // 自动续期也拿不到 token：引导用户走首页 Hello 手动重登
            showBackendGuide('登录已失效');
            reject(error);
            return;
          }

          // 请求成功：视为后端已恢复
          markBackendUp();
          const response: AxiosResponse = {
            data: res.data,
            status: res.statusCode,
            statusText: res.errMsg,
            headers: res.header || {},
            config: config,
            request: null
          };
          resolve(response);
        },
        fail: (res: any) => {
          const error = new Error(res.errMsg || 'Request failed') as Error & {
            response?: unknown;
          };
          error.response = {
            data: res.data,
            status: res.statusCode,
            statusText: res.errMsg,
            headers: res.header || {},
            config: config,
            request: null
          };
          logRequestError('Request failed', error, config);
          showBackendGuide(res.errMsg || '');
          reject(error);
        }
      };

      if (data && method.toUpperCase() !== 'GET') {
        uniConfig.data = data;
      }

      uni.request(uniConfig);
    });

  const tokenStore = useTokenStore();
  const token = tokenStore.token || uni.getStorageSync('token') || '';

  // 已确认后端不可用 / 本地断网时，立即给出引导，不等请求超时
  if (isBackendDown() || isOffline()) {
    showBackendGuide();
  }

  return send(token, 0);
};

class HttpRequest<
  SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  public CourseController = new Course(this);
  public CoursesController = new Courses(this);
  public SearchController = new Search(this);
  public CommentController = new Comment(this);
  public ActionController = new Like(this);
  public ProposalController = new Proposal(this);
  public TeacherController = new Teacher(this);
  public AuthController = new Auth(this);
  public UserController = new User(this);
  public ChangeLogController = new ChangeLog(this);
}

const api = new HttpRequest({
  baseURL: import.meta.env.VITE_SERVER_HOST_PORT,
  adapter: uniRequestAdapter,
  timeout: 30000
});

export default api;
