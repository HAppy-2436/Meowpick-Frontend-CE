import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";
// import VComponents from 'unplugin-vue-components/vite'
import Components from "@uni-helper/vite-plugin-uni-components";
import { NutResolver } from "nutui-uniapp";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      "process.env": env
    },
    css: {
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")]
      },
      preprocessorOptions: {
        scss: (() => {
          const p = require('path');
          const t = p.resolve(__dirname, 'src/styles/_tokens.scss').replace(/\\\\/g, '/');
          const m = p.resolve(__dirname, 'src/styles/_mixins.scss').replace(/\\\\/g, '/');
          const a = p.resolve(__dirname, 'src/styles/_animations.scss').replace(/\\\\/g, '/');
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
        imports: ["vue", "uni-app", "pinia"],
        dirs: ["src/**/index.ts", "src/api/*.ts"]
      })
    ]
  };
});
