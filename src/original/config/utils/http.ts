import { ContentType, HttpClient } from "@/original/api/http-client";
import { Course } from "@/original/api/Course";
import { Courses } from "@/original/api/Courses";
import { Comment } from "@/original/api/Comment";
import { Teacher } from "@/original/api/Teacher";
import { Search } from "@/original/api/Search";
import { Like } from "@/original/api/Like";
import { Proposal } from "@/original/api/Proposal";
import { Auth } from "@/original/api/Auth";
import { ChangeLog } from "@/original/api/ChangeLog";
import { User } from "@/original/api/User";
import { StorageKeys } from "@/original/utils/const";
import { UniAdapter } from "uniapp-axios-adapter";
import { useTokenStore } from "@/original/config";
// 复用主包（定制版）的登录流程：原始版皮肤请求前等待同一登录态就绪，
// 并在 token 失效时自动重新登录（与定制版一致的续期策略）。
import { waitForLogin, relogin } from "@/utils/init";

class HttpRequest<
    SecurityDataType = unknown
> extends HttpClient<SecurityDataType> {
  public CourseController = new Course(this);
  public CoursesController = new Courses(this);
  public SearchController = new Search(this);
  public CommentController = new Comment(this);
  public TeacherController = new Teacher(this);
  public ProposalController = new Proposal(this);
  public LikeController = new Like(this);
  // 兼容上游旧代码中的 http.ActionController.like / .likeCreate
  public ActionController = new Like(this);
  public AuthController = new Auth(this);
  public ChangeLogController = new ChangeLog(this);
  public UserController = new User(this);

  async sign_in(data: any) {
    const resp = await this.request({
      path: `/api/auth/sign_in`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      baseURL: import.meta.env.VITE_SERVER_HOST_PORT
    });
    useTokenStore().store(resp.data.data.accessToken);
    console.log(resp.data.data.accessToken);
  }
}

const api = new HttpRequest({
  paramsSerializer: (params) => {
    const parts: string[] = [];
    Object.entries(params || {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else if (value !== undefined && value !== null && value !== '') {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    });
    return parts.join('&');
  },
  baseURL: import.meta.env.VITE_SERVER_HOST_PORT,
  adapter: UniAdapter, // 指定适配器
  timeout: 20000
});

/**
 * 判定是否为登录态失效：
 * - HTTP 401；
 * - 200 + 业务码 100000001（后端 "user not login"）；
 * - 200 + 业务码 2xxxx（历史鉴权错误码段）。
 */
function isAuthFailure(status: number | undefined, data: any): boolean {
  if (status === 401) return true;
  const code = data && typeof data === 'object' ? data.code : undefined;
  if (typeof code !== 'number') return false;
  return code === 100000001 || (code >= 20000 && code < 30000);
}

/**
 * token 失效后自动重登并重试原请求（每个请求最多重试一次）。
 * 重登成功后 request 拦截器会重新读取新的 token。
 */
async function retryAfterRelogin(config: any): Promise<any | null> {
  if (!config || config.__authRetried) return null;
  config.__authRetried = true;
  console.warn('[original-http] 登录态失效，自动重新登录…');
  const token = await relogin();
  if (!token) {
    console.error('[original-http] 自动重登失败');
    return null;
  }
  return api.instance.request(config);
}

api.instance.interceptors.request.use(
    async (config) => {
      // 等待主包共享登录完成，避免原始版皮肤早期请求缺少 token
      await waitForLogin();
      // 后端环境必须与主包一致：未配置时默认 test，否则空值会被后端拒绝
      const backendEnv = uni.getStorageSync(StorageKeys.BackendEnv) || 'test';
      const token = useTokenStore().token || uni.getStorageSync('token') || '';
      config.headers![process.env.VITE_TOKEN_NAME] = `Bearer ${token}`;
      config.headers!["X-Xh-Env"] = backendEnv;
      console.log('[DEBUG] request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        token: token ? 'exists' : 'empty'
      });
      return config;
    },
    (error) => {
      console.log(error);
      Promise.reject(error);
    }
);

api.instance.interceptors.response.use(
    async (res) => {
      if (res.data) {
        const userId = res.data.userId ?? res.data.data?.userId;
        if (userId != undefined) {
          useTokenStore().setUserId(userId);
        }
      }

      // 200 但业务码为 2xxxx：登录态失效，自动重登并重试
      if (isAuthFailure(res.status, res.data)) {
        const retried = await retryAfterRelogin(res.config);
        if (retried) return retried;
      }

      return res;
    },
    async (error) => {
      // HTTP 401：登录态失效，自动重登并重试
      if (isAuthFailure(error?.response?.status, error?.response?.data)) {
        const retried = await retryAfterRelogin(error?.config);
        if (retried) return retried;
        return Promise.reject(
            new Error("无效的会话，或者会话已过期，请重新登录。")
        );
      }

      let msg = String(error?.errMsg || error?.message || '');
      if (msg === "Network Error") {
        msg = "后端接口连接异常";
      } else if (msg.includes("timeout")) {
        msg = "系统接口请求超时";
      } else if (msg.includes("Request failed with status code")) {
        // 获得异常http状态码
        const statusCode = +msg.substr(msg.length - 3);
        msg = "系统接口" + statusCode + "异常";
      }
      console.error(msg || error);
      return Promise.reject(error);
    }
);
export default api;
