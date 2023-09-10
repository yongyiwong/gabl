import mongoose, { Model, Document } from 'mongoose';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { upperFirst } from 'lodash';
import DataLoader from 'dataloader';
import sift from 'sift';
import { transformQuery } from '../../helpers/query';
import { ObjectId } from 'mongodb';
import {
  Post,
  User,
  Event,
  EventQuery,
  CreateDeleteEventInput,
  CreateEventResponse,
  DeleteEventResponse,
  NotificationDismissed,
  PostView,
  CommentLike,
  Comment,
} from '../../../shared/types';

enum EventObjectType {
  POST_LIKE = 'postLike',
  POST_VIEW = 'postView',
  COMMENT_LIKE = 'commentLike',
  NOTIFICATION_DISMISSED = 'notificationDismissed',
  CUSTOM = 'custom',
}

type IEvent = Event &
  Partial<NotificationDismissed> &
  Partial<PostView> &
  Partial<CommentLike>;
const EventSchema = new mongoose.Schema(
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
    comment: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
      index: true,
    },
    type: {
      type: String,
      index: true,
      enum: Object.values(EventObjectType),
      required: true,
    },
    progress: Number,
    data: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const EventModel: Model<IEvent & Document> = mongoose.model<IEvent & Document>(
  'Event',
  EventSchema
);

class EventDataSource extends MongoDataSource<IEvent & Document> {
  batch: DataLoader<IEvent & Document, IEvent & Document>;
  bCount: DataLoader<IEvent & Document, IEvent & Document>;
  bExists: DataLoader<IEvent & Document, IEvent & Document>;

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
    return this.model.exists(transformQuery(query));
  }

  count(query) {
    return this.model.countDocuments(transformQuery(query));
  }

  list({ query }) {
    return this.model.find(transformQuery(query)).populate('user');
  }

  async batchFind(queries) {
    const transformedQueries = queries.map((q) => transformQuery(q));
    const events = await this.model.find({ $or: transformedQueries }, null, {
      sort: { created_at: 1 },
    });
    return transformedQueries.map((query) => events.filter(sift(query)));
  }

  async batchExists(queries) {
    const aggregate = await this.model.aggregate([
      {
        $match: {
          $or: queries,
        },
      },
      {
        $group: {
          _id: {
            comment: '$comment',
            post: '$post',
            type: '$type',
            user: '$user',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          comment: '$_id.comment',
          post: '$_id.post',
          type: '$_id.type',
          user: '$_id.user',
          count: '$count',
        },
      },
    ]);

    const res = queries.map(
      (query) =>
        aggregate.filter(sift(query)).map((o) => o.count && o.count > 0)[0] ||
        false
    );
    return res; // queries.map(query => events.filter(sift(query)));
  }

  async batchCount(queries) {
    const aggregate = await this.model.aggregate([
      {
        $match: {
          $or: queries,
        },
      },
      {
        $group: {
          _id: {
            comment: '$comment',
            post: '$post',
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          comment: '$_id.comment',
          post: '$_id.post',
          type: '$_id.type',
          count: '$count',
        },
      },
    ]);

    const res = queries.map(
      (query) => aggregate.filter(sift(query)).map((o) => o.count)[0] || 0
    );
    return res; // queries.map(query => events.filter(sift(query)));
  }

  async delete({ event }) {
    try {
      const foundEvent = await this.model.findOneAndDelete({
        ...event,
        user: this.context.user._id,
      });

      return {
        code: 200,
        success: true,
        event: foundEvent,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async create({ event }) {
    try {
      //  Attach current user to a new event
      event.user = this.context.user._id;

      if (event.post && event.comment) {
        //  eslint-disable-next-line quotes
        throw new Error("`post` and `comment` can't coexist on Event");
      }

      const newEvent = await this.model.create(event);
      await newEvent.save();

      return {
        code: 200,
        success: true,
        event: newEvent,
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

const eventDataSource = {
  events: new EventDataSource(EventModel),
};

const postResolver = {
  post(event, _, { dataSources: { posts } }): Post {
    return posts.get(event.post);
  },
};

const eventResolver = {
  EventObjectType,
  Event: {
    __resolveType(obj) {
      return upperFirst(obj.type);
    },
    user(event: Event, _, { dataSources: { users } }): User {
      return users.get(event.user);
    },
  },
  PostLike: {
    ...postResolver,
  },
  PostView: {
    ...postResolver,
  },
  NotificationDismissed: {
    ...postResolver,
  },
  CommentLike: {
    comment(event: IEvent, _: void, { dataSources: { comments } }): Comment {
      return comments.get(event.comment);
    },
  },
  Query: {
    events(_: void, args: EventQuery, { dataSources: { events } }): [IEvent] {
      return events.list(args);
    },
  },
  Mutation: {
    deleteEvent(
      _,
      args: CreateDeleteEventInput,
      { dataSources: { events } }
    ): DeleteEventResponse {
      return events.delete(args);
    },
    createEvent(
      _,
      args: CreateDeleteEventInput,
      { dataSources: { events } }
    ): CreateEventResponse {
      return events.create(args);
    },
  },
};

export { eventResolver, eventDataSource, EventObjectType, EventModel };
