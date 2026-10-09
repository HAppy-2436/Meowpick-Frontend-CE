// 把 src/images/source 下的原图压缩成 PNG 调色板图（palette），写回 src/images 供业务引用。
// 用法：node scripts/gen-images.mjs
// 说明：
//   - 定制版（主包）与原始版（分包）共用同一套图，统一放在 src/images，避免重复维护。
//   - 原图放在 src/images/source/，不被任何代码 import，因此不会被打包，仅作压缩源。
//   - 原始版独有的小图标（addTag / arrow-down 等）体积已很小，不在此脚本管理，但计入总量校验。
//   - 坚持用 PNG 而不用 webp：小程序 webp 在 iOS 上兼容性不稳，PNG 全平台可用，且无“色度抽样”，细字不糊。
//   - 小程序「代码质量」限制：图片 + 音频资源合计 < 200K（构建会按内容去重，脚本按唯一图计数）。
import sharp from 'sharp';
import {
  readdirSync,
  statSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  writeFileSync
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOTAL_LIMIT = 200 * 1024;

const srcDir = join(root, 'src/images/source');
const outDir = join(root, 'src/images');
const origOutDir = join(root, 'src/original/images');

// 原始版独有、被分包引用的图标（不由本脚本生成，但占用图片预算）。
const origOnlyIcons = [
  'addTag-icon',
  'arrow-down',
  'choose-icon',
  'comment-button',
  'go-back2',
  'link-icon',
  'search-icon'
];

// 两个皮肤共用、需要 palette 量化的小图标（原图备份在 source/）。
const sharedIcons = [
  'campus-icon',
  'category-icon',
  'depart-icon',
  'comment-icon',
  'go-back',
  'like-icon',
  'like_active',
  'teacher-icon'
];

// width：按实际展示尺寸的 2~3 倍取整；quality：调色板量化质量；colours：调色板颜色数上限。
const jobs = [
  // 校徽：定制版最大 220px 高、原始版约 50vw；660px≈3x 展示分辨率，配 256 色满血调色板保证细字边缘
  { input: join(srcDir, 'logo.png'), output: join(outDir, 'logo.png'), width: 660, colours: 256 },
  // 课程 emoji 兜底图，实际以 32rpx≈16px 展示
  { input: join(srcDir, 'cat.png'), output: join(outDir, 'cat.png'), width: 128, quality: 90 }
];

for (const f of readdirSync(join(srcDir, 'cat-emoji'))) {
  if (!f.endsWith('.png') || f === 'link-icon.png') continue;
  // 头像最大展示 120rpx(60px)，取 160px；扁平面部渐变放大后视觉无损，限 16 色省一半体积
  jobs.push({ input: join(srcDir, 'cat-emoji', f), output: join(outDir, 'cat-emoji', f), width: 160, colours: 16 });
}

const kb = (bytes) => (bytes / 1024).toFixed(1).padStart(7);
let saved = 0;
let total = 0;
console.log('output'.padEnd(42), 'raw      -> png');
for (const { input, output, width, quality, colours } of jobs) {
  mkdirSync(dirname(output), { recursive: true });
  const opts = { palette: true, effort: 10, compressionLevel: 9 };
  if (quality != null) opts.quality = quality;
  if (colours != null) opts.colours = colours;
  await sharp(input)
    .resize({ width, withoutEnlargement: true })
    .png(opts)
    .toFile(output);

  const rawSize = statSync(input).size;
  const outSize = statSync(output).size;
  saved += rawSize - outSize;
  total += outSize;
  console.log(`${basename(output).padEnd(42)} ${kb(rawSize)}K   -> ${kb(outSize)}K`);
}

// 小图标：从 source/ 备份量化后回写 src/images，避免反复量化造成累积损失。
for (const name of sharedIcons) {
  const out = join(outDir, name + '.png');
  if (!existsSync(out)) continue;
  const backup = join(srcDir, name + '.png');
  if (!existsSync(backup)) copyFileSync(out, backup);
  const buf = await sharp(backup)
    .png({ palette: true, quality: 90, colours: 64, effort: 10, compressionLevel: 9 })
    .toBuffer();
  writeFileSync(out, buf);
  saved += statSync(backup).size - buf.length;
  total += buf.length;
  console.log(`${name.padEnd(42)} ${kb(statSync(backup).size)}K   -> ${kb(buf.length)}K`);
}

// 原始版独有图标：不生成，只计入预算。
for (const name of origOnlyIcons) {
  const p = join(origOutDir, name + '.png');
  if (existsSync(p)) total += statSync(p).size;
}

console.log(`\n共节省 ${(saved / 1024).toFixed(1)}K`);
console.log(`图片合计 ${(total / 1024).toFixed(1)}K / 上限 200K`);
if (total >= TOTAL_LIMIT) {
  console.error('图片合计超过 200K，「代码质量」不会通过');
  process.exit(1);
}
