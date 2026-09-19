import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import AutoImport from 'unplugin-auto-import/vite';
// import VComponents from 'unplugin-vue-components/vite'
import Components from '@uni-helper/vite-plugin-uni-components';
import { NutResolver } from 'nutui-uniapp';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ command, mode }) => {
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
          const a = path
            .resolve(__dirname, 'src/styles/_animations.scss')
            .replace(/\\\\/g, '/');
          // 注意：必须把 animations 也注入每个组件。小程序自定义组件默认 styleIsolation: isolated，
          // app.wxss 的 .mwp-* 工具类无法作用到组件内部；只放全局会导致组件（如首页卡片）丢动画。
          // 允许一定重复打包，优先保证组件内动画/按压反馈可用。
          return {
            additionalData: `@import "nutui-uniapp/styles/variables.scss"; @import "${t}"; @import "${m}"; @import "${a}";`,
            loadPaths: ['src', 'node_modules'],
            includePaths: ['src', 'node_modules']
          };
        })()
      }
    },
    plugins: [
      Components({
        resolvers: [NutResolver()]
      }),
      uni(),
      // UnoCSS(),
      AutoImport({
        imports: ['vue', 'uni-app', 'pinia'],
        dirs: ['src/**/index.ts', 'src/api/*.ts']
      })
    ]
  };
});
