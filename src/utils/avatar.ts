import { TotalTags } from './tags';

// 头像直接复用「发表吐槽」页的猫猫图片，不再单独维护一份图列表。
// 按图片去重后得到 7 张（标签里「快跑」「枯燥」共用同一张，属预期）。
export const DEFAULT_AVATARS: string[] = Array.from(
  new Set(TotalTags.value.map((tag) => tag.icon))
);

const DEFAULT_AVATAR_SET = new Set<string>(DEFAULT_AVATARS);

export const getRandomDefaultAvatar = () =>
  DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

export const isDefaultAvatarUrl = (url?: string) =>
  !!url && DEFAULT_AVATAR_SET.has(url);
