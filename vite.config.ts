import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
import Components from '@uni-helper/vite-plugin-uni-components';
import { NutResolver } from 'nutui-uniapp';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// 小程序自定义组件默认 styleIsolation: isolated，app.wxss 的 .mwp-* 工具类无法作用到组件内部。
// 若把 animations 注入每个组件，会把整套 keyframes + 工具类复制进每个 .wxss（主包因此膨胀数百 KB）。
// 正确做法：显式给组件设 apply-shared，让全局 app.wxss 的类与 keyframes 作用到组件内部，只打包一次。
// 注意：uni-app 生成的组件 json 把 styleIsolation 写成 undefined，因此 Component options 会生效。
const APPLY_SHARED_PLUGIN = 'mwp-apply-shared-style-isolation';
const APPLY_SHARED_OPTIONS = `export default { options: { styleIsolation: 'apply-shared' } };`;

function applySharedStyleIsolation() {
  return {
    name: APPLY_SHARED_PLUGIN,
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (process.env.UNI_PLATFORM !== 'mp-weixin') return;
      if (!id.endsWith('.vue')) return;
      const file = id.replace(/\\/g, '/');
      if (!file.includes('/src/components/')) return;
      if (code.includes('styleIsolation')) return;
      // <script> 与 <script setup> 的语言类型必须一致，否则 @vue/compiler-sfc 报错
      const lang = /<script\s+setup\s+lang="([^"]+)"/.exec(code)?.[1];
      const open = lang ? `<script lang="${lang}">` : '<script>';
      return {
        code: `${code}\n${open}\n${APPLY_SHARED_OPTIONS}\n</script>\n`,
        map: null
      };
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      'process.env': env
    },
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()]
      },
      preprocessorOptions: {
        scss: (() => {
          const t = path
            .resolve(__dirname, 'src/styles/_tokens.scss')
            .replace(/\\\\/g, '/');
          const m = path
            .resolve(__dirname, 'src/styles/_mixins.scss')
            .replace(/\\\\/g, '/');
          // 只注入 tokens / mixins（零 CSS 输出，供组件内使用 $token 与 mixin）。
          // animations（含 keyframes 与 .mwp-* 工具类）不再注入组件：
          //   - keyframes 由 main.scss 全局引入一次，scoped 样式引用未加 hash 的动画名会命中全局定义；
          //   - 工具类由 apply-shared 让 app.wxss 作用到组件内部。
          // 这样避免整套动画 CSS 被复制进每个组件（主包可省数百 KB）。
          return {
            additionalData: `@import "nutui-uniapp/styles/variables.scss"; @import "${t}"; @import "${m}";`,
            loadPaths: ['src', 'node_modules'],
            includePaths: ['src', 'node_modules']
          };
        })()
      }
    },
    plugins: [
      applySharedStyleIsolation(),
      Components({
        resolvers: [NutResolver()]
      }),
      uni(),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        // 仅扫描主包（new 皮肤）的自动导入来源。
        // 刻意排除 src/original/**：上游皮肤自带同名的 config 导出（http / useTokenStore 等），
        // 若一并扫描会与主包产生重复标识符冲突；上游代码已改为显式 import。
        dirs: [
          'src/config/index.*',
          'src/icons/index.*',
          'src/utils/index.*',
          'src/api/*.ts'
        ]
      })
    ]
  };
});
