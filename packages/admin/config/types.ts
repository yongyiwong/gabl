import { ReactNode } from 'react';
import { User as IUser } from '../shared/types';

export enum PostType {
  ARTICLE = 'ARTICLE',
  USER_STORY = 'USER_STORY',
  TIP = 'TIP',
  NOTIFICATION = 'NOTIFICATION',
  ACTIVITY = 'ACTIVITY',
  POST_COLLECTION = 'POST_COLLECTION',
  HABIT = 'HABIT',
}

export enum ProviderType {
  EMAIL = 'email',
  PHONE = 'phone',
}

export type User = IUser & {
  password: string;
  confirmPassword: string;
};

export enum PostMediaType {
  PICTURE = 'PICTURE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
}

export type ErrorMessage = {
  message: string | ReactNode;
};

export type AssessmentResult = {
  _id?: string;
  created_at: string;
  score: number;
  assessment?: {
    _id: string;
    title: string;
    color: string;
  };
};

export type Comment = {
  _id?: string;
  post?: Post;
  user?: User;
  body?: string;
  likes?: number;
  liked?: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export interface FileUploadResponse {
  src: string;
  filename?: string;
  thumbSmall?: string;
  thumbLarge?: string;
}

export interface PostMedia extends FileUploadResponse {
  type: PostMediaType;
}

interface PostCommon {
  __typename?: string;
  _id?: string;
  title?: string;
  slug?: string;
  body?: string;
  user?: string;
  type?: PostType;
  created_at?: Date;
  updated_at?: Date;
  published_at?: Date;
  media?: PostMedia[];
}

export type BasePostLink = {
  title: string;
  excerpt: string;
};
export type PostLinkDetail = {
  title: string;
  excerpt: string;
  activity: Partial<Post>;
};

export type PostLink = BasePostLink & {
  activity?: string;
};

export type HabitReccurence = {
  hour: number;
  minute: number;
  days: number[];
  pushTitle: string;
  pushBody: string;
};

export type Post = PostCommon & {
  pushTitle?: string;
  pushBody?: string;
  tags?: string[];
  views?: number;
  viewed?: boolean;
  likes?: number;
  liked?: boolean;
  comments?: Comment[];
  comments_count?: number;
  bookmarked?: boolean;
  author?: User;
  authorID?: string;
  posts?: Post[];
  postsIDs?: string[];
  public?: boolean;
  user?: Partial<User>;
  links?: PostLinkDetail[] | PostLink[];

  // habits
  icon?: string[];
  reccurence?: HabitReccurence[];
};

export type SubscriptionCode = {
  _id?: string;
  label: string;
  code: string;
  dateStart: string;
  dateEnd: string;
  used?: number;
};
