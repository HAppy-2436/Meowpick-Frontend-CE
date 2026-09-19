// 读取 src/icons/*.svg，生成内联 SVG 字符串映射 src/icons/index.ts
// 用法：node scripts/gen-icons.mjs [--check]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../src/icons');
const target = join(dir, 'index.ts');
const check = process.argv.includes('--check');

const files = readdirSync(dir)
  .filter((f) => f.endsWith('.svg'))
  .sort();

let out = '// 由 scripts/gen-icons.mjs 自动生成，请勿手动编辑。\n';
out += '// 图标来源：Lucide (https://lucide.dev)，ISC License。\n';
out += '// 新增图标：把 .svg 放进 src/icons/ 后运行 `yarn icons:gen`。\n\n';
out += 'export const ICONS = {\n';
for (const file of files) {
  const name = file.replace(/\.svg$/, '');
  const svg = readFileSync(join(dir, file), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+>/g, '>')
    .replace(/> </g, '><')
    .trim();
  out += `  ${JSON.stringify(name)}: ${JSON.stringify(svg)},\n`;
}
out += '} as const;\n\n';
out += 'export type IconName = keyof typeof ICONS;\n';

if (check) {
  const current = readFileSync(target, 'utf8');
  if (current !== out) {
    console.error('src/icons/index.ts 与 svg 源文件不同步，请运行 yarn icons:gen');
    process.exit(1);
  }
  console.log('icons ok');
} else {
  writeFileSync(target, out);
  console.log(`generated ${files.length} icons -> src/icons/index.ts`);
}
