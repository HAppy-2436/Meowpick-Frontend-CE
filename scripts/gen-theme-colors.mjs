// =====================================================================
// 由 src/styles/_tokens.scss 生成 src/config/theme-colors.ts
//
// SCSS 变量是编译期的，JS（如 uni.setNavigationBarColor）拿不到，
// 因此原生 API 需要的颜色必须单独提供。本脚本保证二者单一事实源。
//
// 用法：
//   node scripts/gen-theme-colors.mjs           # 生成/覆盖
//   node scripts/gen-theme-colors.mjs --check    # 仅校验（不一致则退出码 1）
// =====================================================================
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const TOKENS = path.join(root, "src/styles/_tokens.scss");
const OUT = path.join(root, "src/config/theme-colors.ts");

/** 解析 _tokens.scss，返回 token 名 -> 值（仅解析字面量，支持一层 $var 引用） */
function parseTokens(src) {
  const map = new Map();
  for (const rawLine of src.split("\n")) {
    const line = rawLine.replace(/\/\/.*$/, "").trim();
    const m = line.match(/^\$([a-z0-9-]+)\s*:\s*([^;]+);?$/i);
    if (!m) continue;
    map.set(m[1], m[2].trim());
  }
  // 一层引用解析
  for (const [k, v] of map) {
    const ref = v.match(/^\$([a-z0-9-]+)$/i);
    if (ref && map.has(ref[1])) map.set(k, map.get(ref[1]));
  }
  return map;
}

const tokens = parseTokens(fs.readFileSync(TOKENS, "utf8"));

const targets = {
  light: {
    page: "bg-page-light",
    card: "bg-card-light",
    textPrimary: "text-primary-light",
    textSecondary: "text-secondary-light",
  },
  dark: {
    page: "bg-page-dark",
    card: "bg-card-dark",
    textPrimary: "text-primary-dark",
    textSecondary: "text-secondary-dark",
  },
};

const missing = [];
for (const mode of Object.keys(targets)) {
  for (const key of Object.keys(targets[mode])) {
    const name = targets[mode][key];
    if (!tokens.has(name)) missing.push(`$${name}`);
  }
}
if (missing.length) {
  console.error(`[theme-colors] 缺少 token: ${missing.join(", ")}`);
  process.exit(1);
}

const body = Object.entries(targets)
  .map(([mode, keys]) => {
    const lines = Object.entries(keys)
      .map(([key, name]) => `    ${key}: "${tokens.get(name)}",`)
      .join("\n");
    return `  ${mode}: {\n${lines}\n  },`;
  })
  .join("\n");

const content = `// =====================================================================
// 由 scripts/gen-theme-colors.mjs 自动生成，请勿手动编辑。
// 来源：src/styles/_tokens.scss
// 用途：JS 上下文（uni.setNavigationBarColor / setBackgroundColor 等原生 API）
// =====================================================================

export const THEME_COLORS = {
${body}
} as const;
`;

const check = process.argv.includes("--check");

if (check) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (current !== content) {
    console.error(
      "[theme-colors] 与 _tokens.scss 不一致，请运行 `yarn theme:gen` 重新生成。"
    );
    process.exit(1);
  }
  console.log("[theme-colors] 已与 _tokens.scss 保持同步 ✓");
} else {
  fs.writeFileSync(OUT, content, "utf8");
  console.log(`[theme-colors] 已生成 ${path.relative(root, OUT)}`);
}
