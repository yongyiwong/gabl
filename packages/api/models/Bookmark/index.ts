import { ObjectId } from 'mongodb';
import mongoose, { Document, Model } from 'mongoose';

import {
  Bookmark,
  BookmarkQuery,
  CreateDeleteBookmarkInput,
  CreateBookmarkResponse,
  DeleteBookmarkResponse,
} from '../../../shared/types';

import { MongoDataSource } from 'apollo-datasource-mongodb';
import DataLoader from 'dataloader';
import sift from 'sift';
import { isEmpty } from 'lodash';

const BookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      index: true,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const BookmarkModel: Model<Bookmark & Document> = mongoose.model<
  Bookmark & Document
>('Bookmark', BookmarkSchema);

class BookmarkDataSource extends MongoDataSource<Bookmark & Document> {
  batch: DataLoader<Bookmark & Document, Bookmark & Document>;
  bCount: DataLoader<Bookmark & Document, Bookmark & Document>;
  bExists: DataLoader<Bookmark & Document, Bookmark & Document>;

  initialize(config) {
    super.initialize(config);

    this.batch = new DataLoader((queries) => this.batchFind(queries));
    this.bCount = new DataLoader((queries) => this.batchCount(queries), {
      cache: false,
    });
    this.bExists = new DataLoader((queries) => this.batchExists(queries), {
      cache: false,
    });
  }

  exists(query) {
    return this.model.exists(query);
  }

  count(query) {
    return this.model.countDocuments(query);
  }

  list({ query }) {
    if (query && !query.user) {
      query.user = this.context.user._id;
    }

    return this.model.find(query).populate('user');
  }

  async batchFind(queries) {
    const bookmarks = await this.model.find({ $or: queries });
    return queries.map((query) => bookmarks.filter(sift(query)));
  }

  aggregate(queries) {
    return this.model.aggregate([
      { $match: { $or: queries } },
      {
        $group: {
          _id: {
            user: '$user',
            post: '$post',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          user: '$_id.user',
          post: '$_id.post',
          count: '$count',
        },
      },
    ]);
  }

  async batchCount(queries) {
    const aggregate = await this.aggregate(queries);

    return queries.map(
      (query) => aggregate.filter(sift(query)).map((o) => o.count)[0] || 0
    );
  }

  async batchExists(queries) {
    const aggregate = await this.aggregate(queries);

    return queries.map(
      (query) =>
        aggregate.filter(sift(query)).map((o) => o.count && o.count > 0)[0] ||
        false
    );
  }

  async delete({ bookmark }) {
    try {
      const foundBookmark = await this.model.findOneAndDelete({
        ...bookmark,
        user: this.context.user._id,
      });

      return {
        code: 200,
        success: true,
        bookmark: foundBookmark,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async create({ bookmark }) {
    try {
      //  Attach current user to a new bookmark
      if (!bookmark.user) {
        bookmark.user = this.context.user._id;
      }

      const existingBookmark = await this.model.findOne(bookmark);

      if (!isEmpty(existingBookmark)) {
        throw new Error('Bookmark for this post and this user already exists');
      }

      const newBookmark = await this.model.create(bookmark);
      await newBookmark.save();

      return {
        code: 200,
        success: true,
        bookmark: newBookmark,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }
}

const bookmarkDataSource = {
  bookmarks: new BookmarkDataSource(BookmarkModel),
};

const bookmarkResolver = {
  Bookmark: {
    post(bookmark: Bookmark, _: void, { dataSources: { posts } }) {
      return posts.get(bookmark.post);
    },
    user(bookmark: Bookmark, _: void, { dataSources: { users } }) {
      return users.get(bookmark.user);
    },
  },
  Query: {
    bookmarks(
      _: void,
      args: BookmarkQuery,
      { dataSources: { bookmarks } }
    ): [Bookmark] {
      return bookmarks.list(args);
    },
  },
  Mutation: {
    deleteBookmark(
      _: void,
      args: CreateDeleteBookmarkInput,
      { dataSources: { bookmarks } }
    ): DeleteBookmarkResponse {
      return bookmarks.delete(args);
    },
    createBookmark(
      _: void,
      args: CreateDeleteBookmarkInput,
      { dataSources: { bookmarks } }
    ): CreateBookmarkResponse {
      return bookmarks.create(args);
    },
  },
};

export { bookmarkResolver, bookmarkDataSource, BookmarkModel };
