import { ObjectId } from 'mongodb';
import mongoose, { Document, Model } from 'mongoose';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import DataLoader from 'dataloader';
import sift from 'sift';
import { fieldsList } from 'graphql-fields-list';
import { transformQuery } from '../../helpers/query';
import {
  Comment,
  CommentQuery,
  CreateCommentInput,
  UpdateCommentInput,
  CreateUpdateCommentResponse,
  EventObjectType,
  UserRole,
} from '../../../shared/types';

const CommentSchema = new mongoose.Schema(
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
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const CommentModel: Model<Comment & Document> = mongoose.model<
  Comment & Document
>('Comment', CommentSchema);

class CommentDataSource extends MongoDataSource<Comment & Document> {
  batch: DataLoader<Comment & Document, Comment & Document>;
  bCount: DataLoader<Comment & Document, Comment & Document>;

  initialize(config) {
    super.initialize(config);

    this.batch = new DataLoader((queries) => this.batchFind(queries));
    this.bCount = new DataLoader((queries) => this.batchCount(queries));
  }

  get(_id) {
    return this.findOneById(_id);
  }

  list({ query, limit, skip, sort }, fields) {
    return this.model.find(transformQuery(query), fields, {
      limit,
      skip,
      sort,
    });
  }

  count({ query }) {
    return this.model.countDocuments(transformQuery(query));
  }

  async batchFind(queries) {
    const transformedQueries = queries.map((q) => transformQuery(q));
    const comments = await this.model.find({ $or: transformedQueries });
    return transformedQueries.map((query) => comments.filter(sift(query)));
  }

  async batchCount(queries, key = 'post') {
    const aggregate = await this.model.aggregate([
      {
        $match: {
          $or: queries,
        },
      },
      {
        $group: {
          _id: { [key]: `$${key}` },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          [key]: `$_id.${key}`,
          count: '$count',
        },
      },
    ]);

    const res = queries.map(
      (query) => aggregate.filter(sift(query)).map((o) => o.count)[0] || 0
    );

    return res; // queries.map(query => events.filter(sift(query)));
  }

  async update({ _id, update }) {
    try {
      const comment = await this.model.findOne({ _id }, 'user');

      if (update.user && comment.user.role !== UserRole.Admin) {
        throw new Error('Users can\'t transfer comment ownership');
      }

      const updatedComment = await this.model.findOneAndUpdate(
        { _id },
        update,
        { new: true }
      );

      return {
        code: 200,
        success: true,
        comment: updatedComment,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async create({ comment }) {
    try {
      //  Attach current user to a new comment if none is provided
      //  Useful when role='user' is creating a comment and not admin assigning other user as author
      comment.user = this.context.user._id;

      const newComment = await this.model.create(comment);
      await newComment.save();

      return {
        code: 200,
        success: true,
        comment: newComment,
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
      const comment = await this.model.findById(_id);

      if (
        this.context.user.role !== 'admin' &&
        this.context.user._id !== comment.user
      ) {
        throw new Error('Can\'t delete comment: user doesn\'t match');
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
}

const commentDataSource = {
  comments: new CommentDataSource(CommentModel),
};

const commentResolver = {
  Comment: {
    likes(comment: Comment, _: void, { dataSources: { events } }) {
      return events.bCount.load({
        type: EventObjectType.CommentLike,
        comment: comment._id,
      });
    },
    liked(comment: Comment, _: void, { user, dataSources: { events } }) {
      return events.bExists.load({
        type: EventObjectType.CommentLike,
        comment: comment._id,
        user: user._id,
      });
    },
    user(comment: Comment, _: void, { dataSources: { users } }) {
      return users.get(comment.user._id);
    },
    post(comment: Comment, _: void, { dataSources: { posts } }) {
      return posts.get(comment.post._id);
    },
  },
  Query: {
    comments(_: void, args: CommentQuery, { dataSources: { comments } }, info) {
      return comments.list(args, fieldsList(info));
    },
    countComments(_: void, args: CommentQuery, { dataSources: { comments } }) {
      return comments.count(args);
    },
  },
  Mutation: {
    updateComment(
      _: void,
      args: CreateCommentInput,
      { dataSources: { comments } }
    ): CreateUpdateCommentResponse {
      return comments.update(args);
    },
    deleteComment(
      _: void,
      args,
      { dataSources: { comments } }
    ): CreateUpdateCommentResponse {
      return comments.delete(args);
    },
    createComment(
      _: void,
      args: UpdateCommentInput,
      { dataSources: { comments } }
    ): CreateUpdateCommentResponse {
      return comments.create(args);
    },
  },
};

export { commentResolver, commentDataSource, CommentModel };
