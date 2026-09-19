import catFace from '@/images/cat-emoji/cat_face.png';
import catGrinning from '@/images/cat-emoji/grinning_cat.png';
import catHeartEyes from '@/images/cat-emoji/heart-eyes-cat.png';
import catGrinningEyes from '@/images/cat-emoji/grinning_cat_with_smiling_eyes.png';
import catKissing from '@/images/cat-emoji/kissing_cat.png';
import catCrying from '@/images/cat-emoji/crying_cat.png';
import catPouting from '@/images/cat-emoji/pouting_cat.png';
import catHardcore from '@/images/cat-emoji/hardcore-cat.png';

export const DEFAULT_AVATARS = [
  catFace,
  catGrinning,
  catHeartEyes,
  catGrinningEyes,
  catKissing,
  catCrying,
  catPouting,
  catHardcore
];

const DEFAULT_AVATAR_SET = new Set<string>(DEFAULT_AVATARS);

export const getRandomDefaultAvatar = () =>
  DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];

export const isDefaultAvatarUrl = (url?: string) =>
  !!url && DEFAULT_AVATAR_SET.has(url);
