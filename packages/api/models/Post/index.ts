import mongoose, { Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { fieldsList } from 'graphql-fields-list';
import { GraphQLResolveInfo } from 'graphql';
const { schedule } = require('../../services/scheduler');
import {
  upperFirst,
  union,
  snakeCase,
  map,
  omit,
  isEmpty,
  orderBy,
  trim,
  toLower,
} from 'lodash';
import DataLoader from 'dataloader';
import sift from 'sift';
import { messaging } from '../../services/firebase';
import { transformQuery } from '../../helpers/query';
import { MediaSchema, LocationSchema } from '../../share/schemas';
import { fetchAllNews } from '../../services/news';
import {
  PostType,
  MediaType,
  TakeTime,
  TimeFrame,
  ContactMethod,
  PostStatus,
  ArticleType,
  MAXIMUM_DISTANCE_DIFFERENCE,
} from '../../share/types';
import { ListQuery } from '../BaseDataSource';
import {
  Post,
  Ask,
  Give,
  Gab,
  Notification,
  PostQuery,
  CreatePostInput,
  UpdatePostInput,
  UpdatePostResponse,
  DeleteEventResponse,
  OrderPostResponse,
  DeletePostResponse,
  EventObjectType,
  User,
  UserRole,
  PostSort,
  PostStatus as SchemaPostStatus,
} from '../../../shared/types';

const MAXIMUM_ACTIVE_POST_COUNT = 3;

const PostSchema = new mongoose.Schema(
  {
    //  Common Fields
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
      enum: Object.values(PostType),
    },
    title: {
      type: String,
      // required: true
    },
    slug: String,
    body: {
      type: String,
      // required: true
    },
    take_time: {
      type: String,
      enum: Object.values(TakeTime),
    },
    time_frame: {
      type: String,
      enum: Object.values(TimeFrame),
    },
    contact_method: {
      type: String,
      enum: Object.values(ContactMethod),
    },
    published_at: {
      type: Date,
      index: true,
    },
    //  article
    link: {
      type: String,
      default: false,
    },
    articleType: {
      type: String,
      enum: Object.values(ArticleType),
    },
    //  article, userStory, diaryEntry
    media: [MediaSchema],
    //  article, tip
    tags: {
      type: [mongoose.Types.ObjectId],
      ref: 'Tag',
      index: true,
    },

    //  Push Notifications stuff
    pushTitle: String,
    pushBody: String,

    order: {
      type: Number,
      default: -1,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.ACTIVE,
    },

    //only for ask
    location: LocationSchema,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

PostSchema.index({ location: '2dsphere' });

type IPost = Post &
  Partial<Give> &
  Partial<Ask> &
  Partial<Gab> &
  Partial<Notification>;

const PostModel: Model<IPost & Document> = mongoose.model<IPost & Document>(
  'Post',
  PostSchema
);

type LocationQuery = {
  $near: {
    $maxDistance: Number;
    $geometry: Location;
  };
};

type IPostQuery = PostQuery & {
  location?: LocationQuery;
};

class PostDataSource extends MongoDataSource<IPost & Document> {
  batch: DataLoader<IPost & Document, IPost & Document>;

  initialize(config) {
    super.initialize(config);
    this.batch = new DataLoader((queries) => this.batchFind(queries));
  }

  async augmentQuery(q) {
    // avoid mutation
    let query = { ...q };
    const { events, bookmarks } = this.context.dataSources;

    if (query && query.tags && query.tags.length > 0) {
      query.tags = { $in: query.tags };
    }

    if (query && query._id && query._id.length > 0) {
      query._id = { $in: query._id };
    }

    if (query && trim(query.search_txt) !== '') {
      query = {
        ...query,
        $or: [
          { title: { $regex: query.search_txt, $options: 'i' } },
          { body: { $regex: query.search_txt, $options: 'i' } },
        ],
      };
    }

    if (query && query.liked) {
      const likedPosts = await events.model.find(
        {
          user: this.context.user._id,
          type: EventObjectType.PostLike,
        },
        ['post']
      );

      const likedPostsIds = map(likedPosts, 'post');

      query._id = { $in: union(query._id ? query._id.$in : [], likedPostsIds) };
    }

    if (query && query.viewed !== undefined) {
      const viewedPosts = await events.model.find(
        {
          user: this.context.user._id,
          type: EventObjectType.PostView,
        },
        ['post']
      );

      const viewedPostsIds = map(viewedPosts, 'post');

      query._id = query.viewed
        ? {
          $in: union(query._id ? query._id.$in : [], viewedPostsIds),
        }
        : {
          ...query._id,
          $nin: union(query._id ? query._id.$nin : [], viewedPostsIds),
        };
    }
    if (query && query.dismissed !== undefined) {
      const dismissedPosts = await events.model.find(
        {
          user: this.context.user._id,
          type: EventObjectType.NotificationDismissed,
        },
        ['post']
      );

      const dismissedPostsIds = map(dismissedPosts, 'post');

      query._id = query.dismissed
        ? {
          ...query._id,
          $in: union(query._id ? query._id.$in : [], dismissedPostsIds),
        }
        : {
          ...query._id,
          $nin: union(query._id ? query._id.$nin : [], dismissedPostsIds),
        };
    }

    if (query && query.bookmarked) {
      const bookmarkedPosts = await bookmarks.model.find(
        {
          user: this.context.user._id,
        },
        ['post']
      );

      const bookmarkedPostsIds = map(bookmarkedPosts, 'post');

      query._id = {
        ...query._id,
        $in: union(query._id ? query._id.$in : [], bookmarkedPostsIds),
      };
    }

    return omit(query, [
      'liked',
      'viewed',
      'dismissed',
      'bookmarked',
      'videoProgress',
      'completed',
      'search_txt',
    ]);
  }

  async myPosts(args: ListQuery<IPostQuery, PostSort>, fields: string[]) {
    if (!args.query || !args.query.type || !args.query.type.length) {
      args = {
        ...args,
        query: {
          ...(args.query ? args.query : {}),
        },
      };
    }
    const user = this.context.user;
    if (
      user._id &&
      args.query.type.find((type) =>
        [PostType.ASK, PostType.GIVE, PostType.GAB].includes(
          toLower(type.toString())
        )
      )
    ) {
      args.query = {
        ...args.query,
        user: user._id,
      };
    }

    return this.list(args, fields);
  }

  async gets(args: ListQuery<IPostQuery, PostSort>, fields: string[]) {
    if (!args.query || !args.query.type || !args.query.type.length) {
      args = {
        ...args,
        query: {
          ...(args.query ? args.query : {}),
        },
      };
    }
    const user = this.context.user;
    if (
      user._id &&
      args.query.type.find((type) =>
        [PostType.ASK, PostType.GIVE, PostType.GAB].includes(
          toLower(type.toString())
        )
      )
    ) {
      args.query = {
        ...args.query,
        user: { $ne: user._id },
      };

      if (user.location) {
        args.query = {
          ...args.query,
          user: { $ne: user._id },
          location: {
            $near: {
              $maxDistance: MAXIMUM_DISTANCE_DIFFERENCE,
              $geometry: user.location,
            },
          },
        };
      }
    }

    return this.list(args, fields);
  }

  async list(args: ListQuery<IPostQuery, any>, fields: string[]) {
    let { query, limit, skip, sort } = args;
    const augQuery = await this.augmentQuery(query);
    const addQueryParams = ['type', 'user'];

    sort = {
      order: 1,
      ...sort,
    };

    const posts = await this.model
      .find(transformQuery(augQuery), union(addQueryParams, fields), {
        limit,
        skip,
        sort,
      })
      .exec();

    return posts;
  }

  async count({ query }) {
    return this.model.countDocuments(transformQuery(query));
  }

  async get(_id) {
    return this.findOneById(_id);
  }

  async batchFind(queries) {
    const transformedQueries = queries.map((q) => transformQuery(q));
    const posts = await this.model.find({ $or: transformedQueries }).lean();

    return transformedQueries.map((query) => posts.filter(sift(query)));
  }

  async random({ query }, fields) {
    //  Count all documents for the query
    const count = await this.model.countDocuments(query);
    //  Skip is random amount of them
    const skip = Math.floor(Math.random() * count);
    //  Find that random document from a bunch
    return this.model.findOne(query, union(['type', 'user'], fields), { skip });
  }

  async reOrder({ order }) {
    const sort = {
      order: 1,
      created_at: -1,
    };

    let posts = await this.model
      .find({ type: order.type }, ['_id', 'type'], {
        limit: 0,
        skip: 0,
        sort: sort,
      })
      .lean();

    const pos = posts.findIndex(
      (p) => p._id.toString() === order._id.toString()
    );
    if (pos !== -1) {
      const post = posts[pos];

      if (order.isUp && pos > 0) {
        posts.splice(pos, 1);
        posts.splice(pos - 1, 0, post);
      }
      if (!order.isUp && pos < posts.length - 1) {
        posts.splice(pos, 1);
        posts.splice(pos + 1, 0, post);
      }
    }

    posts = posts.map((p, index) => {
      return {
        ...p,
        _id: p._id,
        order: index,
        type: p.type,
      };
    });
    for (const post of posts) {
      await this.model.updateOne(
        { _id: post._id },
        { $set: { order: post.order } }
      );
    }

    return {
      code: 200,
      success: true,
      posts: posts,
    };
  }

  async update({ _id, update }) {
    try {
      const post = await this.model.findOne(
        {
          _id: mongoose.Types.ObjectId(_id),
        },
        'user type'
      );

      if (update.user && post.user?.role !== toLower(UserRole.Admin)) {
        // eslint-disable-next-line quotes
        throw new Error("Users can't transfer post ownership");
      }

      const updatedPost = await this.model.findOneAndUpdate({ _id }, update, {
        new: true,
      });

      return {
        code: 200,
        success: true,
        post: updatedPost,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async delete({ _id }) {
    try {
      const post = await this.model.findById(_id);
      if (
        this.context.user.role !== UserRole.Admin &&
        this.context.user._id.toString() !== post.user.toString()
      ) {
        // eslint-disable-next-line quotes
        throw new Error("Can't delete post: user doesn't match");
      }

      await this.model.deleteOne({ _id });

      return {
        code: 200,
        success: true,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async add(user, { post }) {
    //  Attach current user to a new post if none is provided
    //  Useful when role='user' is creating a post and not admin assigning other user as author
    if (!post.user) {
      post.user = user._id;
    }
    //  Generate slug from title if none is provided
    if (!post.slug) {
      post.slug = encodeURIComponent(snakeCase(post.title));
    }
    //  Check if the post is of user created variety
    const isUserPost = [PostType.ASK, PostType.GAB, PostType.GIVE].includes(
      post.type
    );

    //  Posts like that can only be created by the current user (user creating post as himself)
    if (isUserPost && post.user !== user._id) {
      throw new Error(
        // eslint-disable-next-line quotes
        "Can't create request, discussions or diaryEntry for someone other than yourself"
      );
    }

    if (post.type === PostType.ASK) {
      const askCount = await this.count({
        query: {
          user: user._id,
          type: PostType.ASK,
          status: PostStatus.ACTIVE,
        },
      });

      if (askCount > MAXIMUM_ACTIVE_POST_COUNT) {
        throw new Error(
          // eslint-disable-next-line quotes
          `You can only have ${MAXIMUM_ACTIVE_POST_COUNT} active request`
        );
      }

      post.location = user.location;
    }

    //  User posts should always have one or more pictures attached
    if (isUserPost && !post.media) {
      // eslint-disable-next-line quotes
      throw new Error("Can't create userStory or diaryEntry without media");
    }

    if (!isUserPost && user.role !== toLower(UserRole.Admin)) {
      throw new Error(
        `Can't create post of type ${post.type}. User must have admin privileges`
      );
    }

    const newPost = await this.model.create(post);

    //  If scheduled publishing date is not set, it should be the same as current date
    if (!post.published_at) {
      newPost.published_at = newPost.created_at;
    }

    //  Send push notification if pushTitle is present
    if (!isEmpty(newPost?.pushTitle) || !isEmpty(newPost?.pushBody)) {
      await messaging.sendToTopic(
        'general',
        {
          notification: {
            title: newPost?.pushTitle,
            body: newPost?.pushBody,
            tag: 'newPost',
          },
          data: {
            post_id: newPost._id.toString(),
            post_type: newPost.type.toString(),
          },
        },
        {
          android: {
            notification: {
              click_action: 'OPEN_POST', //`_${ newPost.type }:${ newPost._id }`
            },
          },
          apns: {
            payload: {
              category: 'general',
              badge: 1,
            },
          },
        }
      );
    }
    return newPost;
  }

  async create(user, { post }) {
    try {
      const newPost = await this.add(user, { post });

      return {
        code: 200,
        success: true,
        post: newPost,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  static async fetchNews(posts: PostDataSource, log = true): Promise<Boolean> {
    return posts.addNews(log);
  }

  async addNews(log: boolean = true) {
    try {
      //will get admin user
      const users = await this.context.dataSources.users.list({
        query: { role: toLower(UserRole.Admin) },
        limit: 1,
        skip: 0,
      });

      if (!users || !users.length) {
        throw new Error('No Admin exists');
      }

      const user = users[0];
      let news = await fetchAllNews();
      let published_at = news.map((n) => n.published_at);
      published_at = published_at.filter((pub) => pub);
      const existingNews = await this.model.find(
        { published_at: published_at },
        ['published_at']
      );

      published_at = existingNews.map((n) => n.published_at.toString());
      news = news.filter(
        (n) => !published_at.includes(n.published_at.toString())
      );

      await Promise.all(
        news.map(async (p) => {
          await this.add(user, { post: p });
        })
      );

      return true;
    } catch (e) {
      console.log('manualFetchNews error', e);
      return false;
    }
  }
}

const postDataSource = {
  posts: new PostDataSource(PostModel),
};

const commonResolvers = {
  user(post: IPost, _: void, { dataSources: { users } }) {
    return users.get(post.user);
  },
  bookmarked(post: IPost, _: void, { user, dataSources: { bookmarks } }) {
    return bookmarks.bExists.load({ post: post._id, user: user._id });
  },
  views(post: IPost, _: void, { dataSources: { events } }) {
    return events.bCount.load({
      type: EventObjectType.PostView,
      post: post._id,
    });
  },
  viewed(post: IPost, _: void, { user, dataSources: { events } }) {
    return events.bExists.load({
      type: EventObjectType.PostView,
      post: post._id,
      user: user._id,
    });
  },
};

const commentsResolver = {
  comments_count: function (
    post: IPost,
    _: void,
    { dataSources: { comments } }
  ) {
    return comments.bCount.load({ post: post._id });
  },
  comments(post: IPost, _: void, { dataSources: { comments } }) {
    return comments.batch.load({ post: post._id });
  },
};

const likesResolver = {
  likes(post: IPost, _: void, { dataSources: { events } }) {
    return events.bCount.load({
      type: EventObjectType.PostLike,
      post: post._id,
    });
  },
  liked(post: IPost, _: void, { user, dataSources: { events } }) {
    return events.bExists.load({
      type: EventObjectType.PostLike,
      post: post._id,
      user: user._id,
    });
  },
};

const postResolver = {
  PostType,
  MediaType,
  TakeTime,
  TimeFrame,
  ContactMethod,
  PostStatus,
  ArticleType,
  Post: {
    __resolveType(obj) {
      return upperFirst(obj.type);
    },
    user(post: IPost, _: void, { dataSources: { users } }) {
      return users.get(post.user);
    },
  },
  Article: {
    ...commentsResolver,
    ...likesResolver,
    ...commonResolvers,
  },
  Gab: {
    ...commentsResolver,
    ...likesResolver,
    ...commonResolvers,
  },
  Ask: {
    ...commentsResolver,
    ...likesResolver,
    ...commonResolvers,
  },
  Give: {
    ...commentsResolver,
    ...likesResolver,
    ...commonResolvers,
    tags(post: IPost, _: void, { dataSources: { tags } }) {
      return tags.batch.load({ _id: { $in: post.tags } });
    },
  },

  Notification: {
    ...commonResolvers,
    dismissed(post: IPost, _: void, { user, dataSources: { events } }) {
      return events.bExists.load({
        type: EventObjectType.NotificationDismissed,
        post: post._id,
        user: user._id,
      });
    },
  },
  Query: {
    posts(
      _: void,
      args: ListQuery<IPostQuery, PostSort>,
      { user, dataSources: { posts } },
      info: GraphQLResolveInfo
    ): [IPost] {
      return posts.gets(args, fieldsList(info));
    },
    myPosts(
      _: void,
      args: ListQuery<IPostQuery, PostSort>,
      { user, dataSources: { posts, events, bookmarks } },
      info: GraphQLResolveInfo
    ): [IPost] {
      return posts.myPosts(args, fieldsList(info));
    },
    post(
      _: void,
      { _id }: { _id: ObjectId },
      { dataSources: { posts } }
    ): IPost {
      return posts.get(_id);
    },
    countPosts(
      _: void,
      args: IPostQuery,
      { dataSources: { posts, events, bookmarks } }
    ): Number {
      return posts.count(args, events, bookmarks);
    },
  },
  Mutation: {
    deletePost(
      _: void,
      args: CreatePostInput,
      { dataSources: { posts } }
    ): DeletePostResponse {
      return posts.delete(args);
    },
    updatePost(
      _: void,
      args: UpdatePostInput,
      { user, dataSources: { posts } }
    ): UpdatePostResponse {
      return posts.update(args);
    },
    createPost(
      _: void,
      args: CreatePostInput,
      { user, dataSources: { posts } }
    ): UpdatePostResponse {
      return posts.create(user, args);
    },
    reOrder(
      _: void,
      args: CreatePostInput,
      { dataSources: { posts } }
    ): OrderPostResponse {
      return posts.reOrder(args);
    },
    manualFetchNews(
      _: void,
      args: void,
      { user, dataSources: { posts } }
    ): Promise<Boolean> {
      return PostDataSource.fetchNews(posts);
    },
  },
};

const scheduleFetchNews = () => {
  const time = {
    hour: 0,
    minute: 0,
    tz: 'Etc/UTC',
  };

  schedule('fetchFeed', time, () =>
    PostDataSource.fetchNews(postDataSource.posts)
  );
};

export { postResolver, postDataSource, PostType, PostModel, scheduleFetchNews };
