export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  ObjectId: any;
};

export type Article = Post & {
  __typename?: 'Article';
  _id?: Maybe<Scalars['ObjectId']>;
  articleType?: Maybe<ArticleType>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  comments_count?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['DateTime']>;
  liked?: Maybe<Scalars['Boolean']>;
  /** Feedbacks */
  likes?: Maybe<Scalars['Int']>;
  link?: Maybe<Scalars['String']>;
  /** Attach any number of media */
  media?: Maybe<Array<Maybe<PostMedia>>>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  pushBody?: Maybe<Scalars['String']>;
  /** Notification */
  pushTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Video progress in seconds */
  videoProgress?: Maybe<Scalars['Int']>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export enum ArticleType {
  Animals = 'ANIMALS',
  Health = 'HEALTH',
  Inspiring = 'INSPIRING',
  World = 'WORLD',
}

export type Ask = Post & {
  __typename?: 'Ask';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  comments_count?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['DateTime']>;
  liked?: Maybe<Scalars['Boolean']>;
  /** Feedbacks */
  likes?: Maybe<Scalars['Int']>;
  location?: Maybe<Location>;
  /** Attach any number of media */
  media?: Maybe<Array<Maybe<PostMedia>>>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  pushBody?: Maybe<Scalars['String']>;
  /** Notification */
  pushTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  /** Ask */
  take_time?: Maybe<TakeTime>;
  time_frame?: Maybe<TimeFrame>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Video progress in seconds */
  videoProgress?: Maybe<Scalars['Int']>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export type Bookmark = {
  __typename?: 'Bookmark';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  post?: Maybe<Post>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type BookmarkQuery = {
  user?: InputMaybe<Scalars['ObjectId']>;
};

export type Comment = {
  __typename?: 'Comment';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['DateTime']>;
  liked?: Maybe<Scalars['Boolean']>;
  likes?: Maybe<Scalars['Int']>;
  post?: Maybe<Post>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type CommentLike = Event & {
  __typename?: 'CommentLike';
  _id?: Maybe<Scalars['ObjectId']>;
  comment?: Maybe<Comment>;
  created_at?: Maybe<Scalars['DateTime']>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type CommentQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  created_at?: InputMaybe<DateTimeQuery>;
  post?: InputMaybe<Scalars['ObjectId']>;
  updated_at?: InputMaybe<DateTimeQuery>;
  user?: InputMaybe<Scalars['ObjectId']>;
};

export type CommentSort = {
  created_at?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['Int']>;
};

export enum ContactMethod {
  Appchat = 'APPCHAT',
  Call = 'CALL',
  Text = 'TEXT',
}

export type Conversation = {
  __typename?: 'Conversation';
  _id?: Maybe<Scalars['ObjectId']>;
  conversationId?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['DateTime']>;
  owner?: Maybe<User>;
  participants?: Maybe<Array<Maybe<Participant>>>;
  post?: Maybe<Post>;
  status?: Maybe<ConversationStatusType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  users?: Maybe<Array<Maybe<ConversationUser>>>;
};

export type ConversationQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  conversationId?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<DateTimeQuery>;
  post?: InputMaybe<Scalars['ObjectId']>;
  updated_at?: InputMaybe<DateTimeQuery>;
};

export enum ConversationStatusType {
  Active = 'ACTIVE',
  Removed = 'REMOVED',
}

export type ConversationUser = {
  __typename?: 'ConversationUser';
  participantId?: Maybe<Scalars['String']>;
  userId?: Maybe<Scalars['String']>;
};

export type CreateBookmarkResponse = MutationResponse & {
  __typename?: 'CreateBookmarkResponse';
  bookmark?: Maybe<Bookmark>;
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type CreateCommentInput = {
  body: Scalars['String'];
  post?: InputMaybe<Scalars['ObjectId']>;
};

export type CreateConversationInput = {
  post?: InputMaybe<Scalars['ObjectId']>;
  status?: InputMaybe<ConversationStatusType>;
};

export type CreateConversationResponse = MutationResponse & {
  __typename?: 'CreateConversationResponse';
  code: Scalars['String'];
  conversation?: Maybe<Conversation>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type CreateDeleteBookmarkInput = {
  /** Admins don't control user bookmarks 🙃 Thus, every Bookmarks mutation affects only current user */
  post?: InputMaybe<Scalars['ObjectId']>;
};

export type CreateDeleteEventInput = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  comment?: InputMaybe<Scalars['ObjectId']>;
  /** JSON string or whatever you want to put here */
  data?: InputMaybe<Scalars['String']>;
  post?: InputMaybe<Scalars['ObjectId']>;
  /** For progress events */
  progress?: InputMaybe<Scalars['Int']>;
  type?: InputMaybe<EventObjectType>;
};

export type CreateEventResponse = MutationResponse & {
  __typename?: 'CreateEventResponse';
  code: Scalars['String'];
  event?: Maybe<Event>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type CreateOrderInput = {
  body?: InputMaybe<Scalars['String']>;
  post?: InputMaybe<Scalars['ObjectId']>;
  status?: InputMaybe<OrderStatus>;
};

export type CreatePostInput = {
  body?: InputMaybe<Scalars['String']>;
  contact_method?: InputMaybe<ContactMethod>;
  media?: InputMaybe<Array<InputMaybe<PostMediaInput>>>;
  published_at?: InputMaybe<Scalars['DateTime']>;
  pushBody?: InputMaybe<Scalars['String']>;
  pushTitle?: InputMaybe<Scalars['String']>;
  slug?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PostStatus>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']>>>;
  take_time?: InputMaybe<TakeTime>;
  time_frame?: InputMaybe<TimeFrame>;
  title?: InputMaybe<Scalars['String']>;
  type: PostType;
  user?: InputMaybe<Scalars['String']>;
};

export type CreateTagInput = {
  displayName?: InputMaybe<Scalars['String']>;
  order?: InputMaybe<Scalars['Int']>;
  slug?: InputMaybe<Scalars['String']>;
};

export type CreateTagResponse = MutationResponse & {
  __typename?: 'CreateTagResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  tag?: Maybe<Tag>;
};

export type CreateUpdateCommentResponse = MutationResponse & {
  __typename?: 'CreateUpdateCommentResponse';
  code: Scalars['String'];
  comment?: Maybe<Comment>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type CreateUpdateOrderResponse = MutationResponse & {
  __typename?: 'CreateUpdateOrderResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  order?: Maybe<Order>;
  success: Scalars['Boolean'];
};

export type CreateUserInput = {
  bio?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  firebaseId?: InputMaybe<Scalars['String']>;
  /** fullname is now reqired because of Stripe */
  fullname: Scalars['String'];
  location?: InputMaybe<LocationInput>;
  password?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  picture?: InputMaybe<PostMediaInput>;
  providerType?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<UserRole>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  username?: InputMaybe<Scalars['String']>;
  verifiedId?: InputMaybe<Scalars['Boolean']>;
};

export type CustomEvent = Event & {
  __typename?: 'CustomEvent';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  data?: Maybe<Scalars['String']>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type DateTimeQuery = {
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
};

export type DeleteBookmarkResponse = MutationResponse & {
  __typename?: 'DeleteBookmarkResponse';
  bookmark?: Maybe<Bookmark>;
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type DeleteEventResponse = MutationResponse & {
  __typename?: 'DeleteEventResponse';
  code: Scalars['String'];
  event?: Maybe<Event>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type DeleteOrderResponse = MutationResponse & {
  __typename?: 'DeleteOrderResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type DeleteParticipantInput = {
  conversationId?: InputMaybe<Scalars['String']>;
  post?: InputMaybe<Scalars['ObjectId']>;
  user: Scalars['ObjectId'];
};

export type DeletePostResponse = MutationResponse & {
  __typename?: 'DeletePostResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type Event = {
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export enum EventObjectType {
  CommentLike = 'COMMENT_LIKE',
  Custom = 'CUSTOM',
  NotificationDismissed = 'NOTIFICATION_DISMISSED',
  PostLike = 'POST_LIKE',
  PostView = 'POST_VIEW',
}

export type EventQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  comment?: InputMaybe<Scalars['ObjectId']>;
  created_at?: InputMaybe<DateTimeQuery>;
  post?: InputMaybe<Scalars['ObjectId']>;
  type?: InputMaybe<EventObjectType>;
  updated_at?: InputMaybe<DateTimeQuery>;
  user?: InputMaybe<Scalars['ObjectId']>;
};

export type FirebaseArrayIndexError = {
  __typename?: 'FirebaseArrayIndexError';
  error: FirebaseError;
  index: Scalars['Int'];
};

export type FirebaseError = {
  __typename?: 'FirebaseError';
  code: Scalars['String'];
  message: Scalars['String'];
  stack?: Maybe<Scalars['String']>;
};

export type Gab = Post & {
  __typename?: 'Gab';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  comments_count?: Maybe<Scalars['Int']>;
  created_at?: Maybe<Scalars['DateTime']>;
  liked?: Maybe<Scalars['Boolean']>;
  /** Feedbacks */
  likes?: Maybe<Scalars['Int']>;
  /** Attach any number of media */
  media?: Maybe<Array<Maybe<PostMedia>>>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  pushBody?: Maybe<Scalars['String']>;
  /** Notification */
  pushTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Video progress in seconds */
  videoProgress?: Maybe<Scalars['Int']>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export type GetSasResponse = {
  __typename?: 'GetSASResponse';
  sas: Scalars['String'];
};

export type Give = Post & {
  __typename?: 'Give';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  comments_count?: Maybe<Scalars['Int']>;
  contact_method?: Maybe<ContactMethod>;
  created_at?: Maybe<Scalars['DateTime']>;
  liked?: Maybe<Scalars['Boolean']>;
  /** Feedbacks */
  likes?: Maybe<Scalars['Int']>;
  /** Attach any number of media */
  media?: Maybe<Array<Maybe<PostMedia>>>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  pushBody?: Maybe<Scalars['String']>;
  /** Notification */
  pushTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  /** Act as category */
  tags?: Maybe<Array<Maybe<Tag>>>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Video progress in seconds */
  videoProgress?: Maybe<Scalars['Int']>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export type Location = {
  __typename?: 'Location';
  coordinates: Array<Maybe<Scalars['Float']>>;
  type: Scalars['String'];
};

export type LocationInput = {
  coordinates: Array<InputMaybe<Scalars['Float']>>;
  type?: InputMaybe<Scalars['String']>;
};

export enum MediaType {
  Audio = 'AUDIO',
  Doc = 'DOC',
  Picture = 'PICTURE',
  Video = 'VIDEO',
}

export type MessagingTopicManagementResponse = {
  __typename?: 'MessagingTopicManagementResponse';
  errors?: Maybe<Array<Maybe<FirebaseArrayIndexError>>>;
  failureCount?: Maybe<Scalars['Int']>;
  successCount?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createBookmark?: Maybe<CreateBookmarkResponse>;
  createComment?: Maybe<CreateUpdateCommentResponse>;
  createEvent?: Maybe<CreateEventResponse>;
  createOrder?: Maybe<CreateUpdateOrderResponse>;
  createPost?: Maybe<UpdatePostResponse>;
  createTag?: Maybe<CreateTagResponse>;
  /** Create a User. Don't know much about Firebase Auth and how user it is handled. I imagine that it needs to be mirrored here in DB to link it to Posts and Quizzes and all that stuff */
  createUser?: Maybe<UpdateUserResponse>;
  deleteBookmark?: Maybe<DeleteBookmarkResponse>;
  deleteComment?: Maybe<CreateUpdateCommentResponse>;
  deleteEvent?: Maybe<DeleteEventResponse>;
  deleteOrder?: Maybe<DeleteOrderResponse>;
  deleteParticipant?: Maybe<CreateConversationResponse>;
  deletePost?: Maybe<DeletePostResponse>;
  deleteTag?: Maybe<CreateTagResponse>;
  manualExpire?: Maybe<Scalars['Boolean']>;
  manualFetchNews?: Maybe<Scalars['Boolean']>;
  ping?: Maybe<Scalars['String']>;
  reOrder?: Maybe<OrderPostResponse>;
  /** Subscribe device token to all notifications */
  subscribe?: Maybe<SubscribeRespose>;
  unsubscribe?: Maybe<SubscribeRespose>;
  updateComment?: Maybe<CreateUpdateCommentResponse>;
  updateOrder?: Maybe<CreateUpdateOrderResponse>;
  updatePost?: Maybe<UpdatePostResponse>;
  /** Update the User. Allowed props are currently `fullname`, `username` and `picture` as per design requirements. */
  updateUser?: Maybe<UpdateUserResponse>;
};

export type MutationCreateBookmarkArgs = {
  bookmark: CreateDeleteBookmarkInput;
};

export type MutationCreateCommentArgs = {
  comment: CreateCommentInput;
};

export type MutationCreateEventArgs = {
  event: CreateDeleteEventInput;
};

export type MutationCreateOrderArgs = {
  order: CreateOrderInput;
};

export type MutationCreatePostArgs = {
  post: CreatePostInput;
};

export type MutationCreateTagArgs = {
  tag: CreateTagInput;
};

export type MutationCreateUserArgs = {
  user?: InputMaybe<CreateUserInput>;
};

export type MutationDeleteBookmarkArgs = {
  bookmark: CreateDeleteBookmarkInput;
};

export type MutationDeleteCommentArgs = {
  _id: Scalars['ObjectId'];
};

export type MutationDeleteEventArgs = {
  event: CreateDeleteEventInput;
};

export type MutationDeleteOrderArgs = {
  _id: Scalars['ObjectId'];
};

export type MutationDeleteParticipantArgs = {
  participant: DeleteParticipantInput;
};

export type MutationDeletePostArgs = {
  _id: Scalars['ObjectId'];
};

export type MutationDeleteTagArgs = {
  _id?: InputMaybe<Scalars['ObjectId']>;
};

export type MutationReOrderArgs = {
  order?: InputMaybe<OrderInput>;
};

export type MutationSubscribeArgs = {
  resubscribe?: InputMaybe<Scalars['Boolean']>;
  tokens?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type MutationUnsubscribeArgs = {
  tokens?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export type MutationUpdateCommentArgs = {
  _id: Scalars['ObjectId'];
  update: UpdateCommentInput;
};

export type MutationUpdateOrderArgs = {
  _id: Scalars['ObjectId'];
  update: UpdateOrderInput;
};

export type MutationUpdatePostArgs = {
  _id: Scalars['ObjectId'];
  update: UpdatePostInput;
};

export type MutationUpdateUserArgs = {
  _id: Scalars['ObjectId'];
  update: UpdateUserInput;
};

export type MutationResponse = {
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type Notification = Post & {
  __typename?: 'Notification';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['DateTime']>;
  /** Query this to filter notifications */
  dismissed?: Maybe<Scalars['Boolean']>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  pushBody?: Maybe<Scalars['String']>;
  /** Notification */
  pushTitle?: Maybe<Scalars['String']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  /** Act as category */
  tags?: Maybe<Array<Maybe<Tag>>>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export type NotificationDismissed = Event & {
  __typename?: 'NotificationDismissed';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  post?: Maybe<Post>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type Order = {
  __typename?: 'Order';
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  owner?: Maybe<User>;
  post?: Maybe<Post>;
  status?: Maybe<OrderStatus>;
  user?: Maybe<User>;
};

export type OrderInput = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  isUp?: InputMaybe<Scalars['Boolean']>;
  type?: InputMaybe<PostType>;
};

export type OrderPostResponse = MutationResponse & {
  __typename?: 'OrderPostResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  posts?: Maybe<Array<Maybe<Post>>>;
  success: Scalars['Boolean'];
};

export type OrderQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  body?: InputMaybe<Scalars['String']>;
  post?: InputMaybe<Scalars['ObjectId']>;
  status?: InputMaybe<OrderStatus>;
};

export type OrderSort = {
  created_at?: InputMaybe<Scalars['Int']>;
};

export enum OrderStatus {
  Accept = 'ACCEPT',
  Complete = 'COMPLETE',
  Expire = 'EXPIRE',
  Reject = 'REJECT',
  Request = 'REQUEST',
  Withdraw = 'WITHDRAW',
}

export type Participant = {
  __typename?: 'Participant';
  accountSid?: Maybe<Scalars['String']>;
  conversationSid?: Maybe<Scalars['String']>;
  dateCreated?: Maybe<Scalars['DateTime']>;
  dateUpdated?: Maybe<Scalars['DateTime']>;
  identity?: Maybe<Scalars['String']>;
  lastReadMessageIndex?: Maybe<Scalars['Int']>;
  lastReadTimestamp?: Maybe<Scalars['String']>;
  roleSid?: Maybe<Scalars['String']>;
  sid?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type Post = {
  _id?: Maybe<Scalars['ObjectId']>;
  body?: Maybe<Scalars['String']>;
  bookmarked?: Maybe<Scalars['Boolean']>;
  created_at?: Maybe<Scalars['DateTime']>;
  order?: Maybe<Scalars['Int']>;
  /** For admin scheduling future posts */
  published_at?: Maybe<Scalars['DateTime']>;
  slug?: Maybe<Scalars['String']>;
  status?: Maybe<PostStatus>;
  title?: Maybe<Scalars['String']>;
  type?: Maybe<PostType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
  /** Viewed by current user */
  viewed?: Maybe<Scalars['Boolean']>;
  /** Number of views */
  views?: Maybe<Scalars['Int']>;
};

export type PostLike = Event & {
  __typename?: 'PostLike';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  post?: Maybe<Post>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type PostMedia = {
  __typename?: 'PostMedia';
  /** VIDEO: duration in seconds, provided by ffprobe */
  duration?: Maybe<Scalars['Float']>;
  filename?: Maybe<Scalars['String']>;
  src: Scalars['String'];
  /** VIDEO: 1920x1080 thumb */
  thumbLarge?: Maybe<Scalars['String']>;
  /** VIDEO: 320x240 thumb. Very small, for lists */
  thumbSmall?: Maybe<Scalars['String']>;
  type: MediaType;
  /** VIDEO: WebM Processed file path. This should be used on all platforms where WebM is supported */
  webm?: Maybe<Scalars['String']>;
};

export type PostMediaInput = {
  duration?: InputMaybe<Scalars['Float']>;
  filename?: InputMaybe<Scalars['String']>;
  src: Scalars['String'];
  thumbLarge?: InputMaybe<Scalars['String']>;
  thumbSmall?: InputMaybe<Scalars['String']>;
  type: MediaType;
  webm?: InputMaybe<Scalars['String']>;
};

export type PostQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  /** Article Only */
  articleType?: InputMaybe<Array<InputMaybe<ArticleType>>>;
  bookmarked?: InputMaybe<Scalars['Boolean']>;
  created_at?: InputMaybe<DateTimeQuery>;
  /** Notificaton Only */
  dismissed?: InputMaybe<Scalars['Boolean']>;
  liked?: InputMaybe<Scalars['Boolean']>;
  published_at?: InputMaybe<DateTimeQuery>;
  slug?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']>>>;
  type?: InputMaybe<Array<InputMaybe<PostType>>>;
  updated_at?: InputMaybe<DateTimeQuery>;
  user?: InputMaybe<Scalars['ObjectId']>;
  viewed?: InputMaybe<Scalars['Boolean']>;
};

export type PostSort = {
  created_at?: InputMaybe<Scalars['Int']>;
  published_at?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['Int']>;
};

export enum PostStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Delete = 'DELETE',
  Draft = 'DRAFT',
  Expire = 'EXPIRE',
}

export enum PostType {
  Article = 'ARTICLE',
  Ask = 'ASK',
  Gab = 'GAB',
  Give = 'GIVE',
  Other = 'OTHER',
}

export type PostView = Event & {
  __typename?: 'PostView';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  post?: Maybe<Post>;
  type?: Maybe<EventObjectType>;
  updated_at?: Maybe<Scalars['DateTime']>;
  user?: Maybe<User>;
};

export type Query = {
  __typename?: 'Query';
  /** Get Coaches that can be Article Authors */
  authors?: Maybe<Array<Maybe<User>>>;
  bookmarks?: Maybe<Array<Maybe<Bookmark>>>;
  /** Any comments of any type, by any common params. Diary Entries are only visible to the user */
  comments?: Maybe<Array<Maybe<Comment>>>;
  conversation?: Maybe<Conversation>;
  conversations?: Maybe<Array<Maybe<Conversation>>>;
  countComments?: Maybe<Scalars['Int']>;
  /** Useful for pagination */
  countOrders?: Maybe<Scalars['Int']>;
  /** Useful for pagination */
  countPosts?: Maybe<Scalars['Int']>;
  countUsers?: Maybe<Scalars['Int']>;
  events?: Maybe<Array<Maybe<Event>>>;
  getSAS?: Maybe<GetSasResponse>;
  /** Get current user */
  me?: Maybe<User>;
  myConversations?: Maybe<Array<Maybe<Conversation>>>;
  myOrders?: Maybe<Array<Maybe<Order>>>;
  myPosts?: Maybe<Array<Maybe<Post>>>;
  nearByUserCount?: Maybe<Scalars['Int']>;
  order?: Maybe<Order>;
  orders?: Maybe<Array<Maybe<Order>>>;
  ping?: Maybe<Scalars['String']>;
  /** Post by _id. Optimization over general query */
  post?: Maybe<Post>;
  /** Any posts of any type, by any common params. Diary Entries are only visible to the user */
  posts?: Maybe<Array<Maybe<Post>>>;
  /** Request phone verification code for current user */
  requestVerifyPhone?: Maybe<MutationResponse>;
  tags?: Maybe<Array<Maybe<Tag>>>;
  user?: Maybe<User>;
  /** Get a list of Users */
  users?: Maybe<Array<Maybe<User>>>;
};

export type QueryBookmarksArgs = {
  query?: InputMaybe<BookmarkQuery>;
};

export type QueryCommentsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<CommentQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<CommentSort>;
};

export type QueryConversationArgs = {
  _id: Scalars['ObjectId'];
};

export type QueryConversationsArgs = {
  query?: InputMaybe<ConversationQuery>;
};

export type QueryCountCommentsArgs = {
  query?: InputMaybe<CommentQuery>;
};

export type QueryCountOrdersArgs = {
  query?: InputMaybe<OrderQuery>;
};

export type QueryCountPostsArgs = {
  query?: InputMaybe<PostQuery>;
};

export type QueryCountUsersArgs = {
  query?: InputMaybe<UserQuery>;
};

export type QueryEventsArgs = {
  query?: InputMaybe<EventQuery>;
};

export type QueryGetSasArgs = {
  blobName: Scalars['String'];
  contentType: Scalars['String'];
};

export type QueryMyOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<OrderQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<OrderSort>;
};

export type QueryMyPostsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<PostQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<PostSort>;
};

export type QueryOrderArgs = {
  _id: Scalars['ObjectId'];
};

export type QueryOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<OrderQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<OrderSort>;
};

export type QueryPostArgs = {
  _id?: InputMaybe<Scalars['ObjectId']>;
};

export type QueryPostsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<PostQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<PostSort>;
};

export type QueryTagsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<TagQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<TagSort>;
};

export type QueryUserArgs = {
  _id?: InputMaybe<Scalars['ObjectId']>;
};

export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<UserQuery>;
  skip?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<UserSort>;
};

export type SubscribeRespose = MutationResponse & {
  __typename?: 'SubscribeRespose';
  code: Scalars['String'];
  firebaseResponse?: Maybe<MessagingTopicManagementResponse>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type Tag = {
  __typename?: 'Tag';
  _id?: Maybe<Scalars['ObjectId']>;
  created_at?: Maybe<Scalars['DateTime']>;
  displayName?: Maybe<Scalars['String']>;
  order?: Maybe<Scalars['Int']>;
  posts?: Maybe<Array<Maybe<Post>>>;
  slug?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['DateTime']>;
};

export type TagQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  all?: InputMaybe<Scalars['Boolean']>;
  created_at?: InputMaybe<DateTimeQuery>;
  slug?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<DateTimeQuery>;
};

export type TagSort = {
  created_at?: InputMaybe<Scalars['Int']>;
};

export enum TakeTime {
  Half = 'HALF',
  Hour = 'HOUR',
  Morehours = 'MOREHOURS',
  Quarter = 'QUARTER',
}

export enum TimeFrame {
  Afternoon = 'AFTERNOON',
  Anytime = 'ANYTIME',
  Asap = 'ASAP',
  Evening = 'EVENING',
  Morning = 'MORNING',
  Night = 'NIGHT',
}

export type TwilioLookupCarrier = {
  __typename?: 'TwilioLookupCarrier';
  errorCode?: Maybe<Scalars['String']>;
  mobileCountryCode?: Maybe<Scalars['String']>;
  mobileNetworkCode?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export type TwilioLookupResponse = {
  __typename?: 'TwilioLookupResponse';
  addOns?: Maybe<Scalars['String']>;
  callerName?: Maybe<Scalars['String']>;
  carrier?: Maybe<TwilioLookupCarrier>;
  countryCode?: Maybe<Scalars['String']>;
  nationalFormat?: Maybe<Scalars['String']>;
  phoneNumber?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type TwilioServiceResponse = MutationResponse & {
  __typename?: 'TwilioServiceResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type UpdateCommentInput = {
  likes?: InputMaybe<Scalars['Int']>;
};

export type UpdateOrderInput = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  status?: InputMaybe<OrderStatus>;
};

export type UpdatePostInput = {
  body?: InputMaybe<Scalars['String']>;
  contact_method?: InputMaybe<ContactMethod>;
  media?: InputMaybe<Array<InputMaybe<PostMediaInput>>>;
  pushBody?: InputMaybe<Scalars['String']>;
  pushTitle?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<PostStatus>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']>>>;
  take_time?: InputMaybe<TakeTime>;
  time_frame?: InputMaybe<TimeFrame>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdatePostResponse = MutationResponse & {
  __typename?: 'UpdatePostResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  post?: Maybe<Post>;
  success: Scalars['Boolean'];
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']>;
  blocked?: InputMaybe<Scalars['Boolean']>;
  email?: InputMaybe<Scalars['String']>;
  fullname?: InputMaybe<Scalars['String']>;
  location?: InputMaybe<LocationInput>;
  password?: InputMaybe<Scalars['String']>;
  phoneNumber?: InputMaybe<Scalars['String']>;
  picture?: InputMaybe<PostMediaInput>;
  providerType?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<UserRole>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  username?: InputMaybe<Scalars['String']>;
  verficationId?: InputMaybe<PostMediaInput>;
  verifiedId?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateUserResponse = MutationResponse & {
  __typename?: 'UpdateUserResponse';
  code: Scalars['String'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type User = {
  __typename?: 'User';
  _id?: Maybe<Scalars['ObjectId']>;
  bio?: Maybe<Scalars['String']>;
  blocked?: Maybe<Scalars['Boolean']>;
  bookmarks?: Maybe<Array<Maybe<Bookmark>>>;
  comments?: Maybe<Array<Maybe<Comment>>>;
  created_at?: Maybe<Scalars['DateTime']>;
  email?: Maybe<Scalars['String']>;
  fcmTokens?: Maybe<Array<Maybe<Scalars['String']>>>;
  firebaseId?: Maybe<Scalars['String']>;
  fullname?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
  phoneNumber?: Maybe<TwilioLookupResponse>;
  phoneVerified?: Maybe<Scalars['Boolean']>;
  picture?: Maybe<PostMedia>;
  point?: Maybe<Scalars['Int']>;
  providerType?: Maybe<Scalars['String']>;
  role?: Maybe<UserRole>;
  signupMethod?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  updated_at?: Maybe<Scalars['DateTime']>;
  username?: Maybe<Scalars['String']>;
  verficationId?: Maybe<PostMedia>;
  verifiedId?: Maybe<Scalars['Boolean']>;
};

export type UserQuery = {
  _id?: InputMaybe<Scalars['ObjectId']>;
  email?: InputMaybe<Scalars['String']>;
  firebaseId?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<Array<InputMaybe<UserRole>>>;
  search_txt?: InputMaybe<Scalars['String']>;
  username?: InputMaybe<Scalars['String']>;
};

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER',
}

export type UserSort = {
  created_at?: InputMaybe<Scalars['Int']>;
  updated_at?: InputMaybe<Scalars['Int']>;
};
