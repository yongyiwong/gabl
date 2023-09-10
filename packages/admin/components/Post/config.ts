import toPairs from 'lodash-es/toPairs';
import filter from 'lodash-es/filter';
import { Post, PostType, ErrorMessage } from '../../config/types';

export const ITEM_HEIGHT = 48;
export const ITEM_PADDING_TOP = 8;
export const PAGE = 25;

export const adminPostQueryVars = {
  limit: PAGE,
  sort: {
    created_at: -1,
  },
};

export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

export type PostProps = {
  post: Post;
  index: number;
  length: number;
  onReOrder: (post: Post, isUp: boolean) => void;
  getTagLabel: (_id: string) => string;
  onPostDelete: () => void;
  setRemoveError: (error: ErrorMessage) => void;
};

export type PostQuery = {
  type?: PostType[];
  tags?: string[];
};

export enum PostCreateType {
  'class' = PostType.POST_COLLECTION,
  'session' = PostType.ARTICLE,
  'article' = PostType.ARTICLE,
  'activity' = PostType.ACTIVITY,
  'user post' = PostType.USER_STORY,
  'habit' = PostType.HABIT,
  'notification' = PostType.NOTIFICATION,
}

export enum PostTypeIcon {
  'class' = '🤼 C-',
  'session' = '📀 Session-',
  'article' = '👁️ Article-',
  'activity' = '🤾 Activity-',
  'user post' = '👀 UserPost-',
  'habit' = '🏒 Habbit-',
  'notification' = '🔔 Notification-',
}

export function getIconByType(type: PostType): string {
  const typePair = toPairs(PostCreateType).find((tp) => tp[1] === type);
  if (typePair) {
    return PostTypeIcon[typePair[0]];
  }
  return '';
}

export function getPostTypeAliases(type: PostType): string {
  return filter(toPairs(PostCreateType), (alias) => alias[1] === type);
}

export function checkPostTypeAlias(type: string, match: PostType[]): boolean {
  return match.includes(PostCreateType[type] as PostType);
}

export const goBackLink = (type: PostType): string => {
  let linkUrl = '';
  switch (type) {
    case PostType.ACTIVITY:
      linkUrl = '/activities';
      break;
    case PostType.HABIT:
      linkUrl = '/habits';
      break;
    case PostType.NOTIFICATION:
      linkUrl = '/notifications';
      break;
    case PostType.POST_COLLECTION:
      linkUrl = '/collections';
      break;
    case PostType.USER_STORY:
      linkUrl = '/userpost';
      break;

    default:
      linkUrl = '/posts';
      break;
  }
  return linkUrl;
};
