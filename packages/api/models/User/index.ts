import mongoose, { Model, Document } from 'mongoose';
import { GraphQLResolveInfo } from 'graphql';

//const mongoose = require('mongoose-keywords');
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { fieldsList } from 'graphql-fields-list';
import DataLoader from 'dataloader';
import { union, omit, isEmpty } from 'lodash';
import sift from 'sift';
import { transformQuery } from '../../helpers/query';
import { ObjectID, ObjectId } from 'mongodb';

import { auth } from '../../services/firebase';
import {
  TwilioService,
  TwilioLookupResponseSchema,
} from '../../services/twilio';
import { MediaSchema, LocationSchema } from '../../share/schemas';

import { MAXIMUM_DISTANCE_DIFFERENCE } from '../../share/types';
import {
  User,
  UserQuery,
  UpdateUserInput,
  UpdateUserResponse,
} from '../../../shared/types';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

const ProviderTypes = ['google.com', 'facebook.com', 'apple.com', 'email'];

const SIGNUP_EMAIL_METHOD = 'email';
const SIGNUP_PHONE_METHOD = 'phone';
const UNIT_POINT = 1000;

const UserSchema = new mongoose.Schema(
  {
    firebaseId: {
      type: String,
      index: true,
    },
    fcmTokens: {
      type: [String],
    },
    email: {
      type: String,
      index: true,
    },
    providerType: {
      type: String,
      index: true,
      required: true,
    },
    phoneNumber: TwilioLookupResponseSchema,
    phoneVerified: {
      type: Boolean,
      index: true,
      default: false,
    },
    verifiedId: {
      type: Boolean,
      required: true,
      index: true,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    //  article, userStory, diaryEntry
    verificationId: String,
    picture: MediaSchema,
    password: String,
    fullname: String,
    username: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    signupMethod: {
      type: String,
      required: true,
      index: true,
    },
    bio: String,
    role: {
      type: String,
      required: true,
      default: UserRole.USER,
      enum: Object.values(UserRole),
    },
    tags: [String],
    point: Number,
    location: LocationSchema,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

UserSchema.index({ location: '2dsphere' });

const UserModel: Model<User & Document> = mongoose.model<User & Document>(
  'User',
  UserSchema
);

class UserDataSource extends MongoDataSource<User & mongoose.Document> {
  twilioService: TwilioService;
  batch: DataLoader<User & Document, User & Document>;
  initialize(config) {
    super.initialize(config);
    this.twilioService = new TwilioService();
    this.batch = new DataLoader((queries) => this.batchFind(queries));
  }

  me() {
    return this.findOneById(this.context.user._id);
  }

  async batchFind(queries) {
    const transformedQueries = queries.map((q) => transformQuery(q));
    const users = await this.model.find({ $or: transformedQueries });
    return transformedQueries.map((query) => users.filter(sift(query)));
  }

  async get(_id) {
    return await this.findOneById(_id);
  }

  async augmentQuery(q) {
    // avoid mutation
    let query = { ...q };

    if (!query.role || !query.role.length) {
      query = omit(query, ['role']);
    }

    if (query && query.search_txt !== undefined) {
      query = {
        ...query,
        $or: [
          { fullname: { $regex: query.search_txt, $options: 'i' } },
          { bio: { $regex: query.search_txt, $options: 'i' } },
        ],
      };
      return omit(query, ['search_txt']);
    }

    return query;
  }

  async list({ query, limit, skip, sort }, fields) {
    const augQuery = await this.augmentQuery(query);

    return this.model
      .find(transformQuery(augQuery), union(['role'], fields), {
        limit,
        skip,
        sort,
      })
      .lean();
  }

  async nearByCount() {
    let query = {};
    if (this.context.user.location) {
      query = {
        location: {
          $near: {
            $maxDistance: MAXIMUM_DISTANCE_DIFFERENCE,
            $geometry: this.context.user.location,
          },
        },
      };
    }
    return await this.model.countDocuments(transformQuery(query));
  }

  count({ query }) {
    return this.model.countDocuments(query);
  }

  async requestVerifyPhone() {
    try {
      if (this.twilioService.verifyService == null) {
        await this.twilioService.init();
      }

      return {
        code: 200,
        success: true,
      };
    } catch (e) {
      return {
        code: 500,
        success: false,
        message: e.message,
      };
    }
  }

  async increasePoint(_id, session) {
    await this.model.updateOne(
      { _id: _id },
      { $inc: { point: UNIT_POINT } },
      { session }
    );
  }

  async update({ _id, update }) {
    try {
      if (update.providerType && !ProviderTypes.includes(update.providerType)) {
        throw new Error('not allowed providertype');
      }

      if (
        typeof update.blocked !== 'undefined' &&
        this.context.user.role !== UserRole.ADMIN
      ) {
        throw new Error('Only admins can block/unblock users');
      }

      if (
        typeof update.role !== 'undefined' &&
        this.context.user.role !== UserRole.ADMIN
      ) {
        throw new Error('Only admins can assign roles');
      }

      if (update.username) {
        const tempUser = await this.model.findOne({
          _id: { $nin: [_id] },
          username: update.username,
        });

        if (tempUser) {
          throw new Error('User name exists');
        }
      }

      const user = await this.get(_id);

      if (update.email && user.signupMethod === SIGNUP_EMAIL_METHOD) {
        const sameEmailUser = await this.model.findOne({
          _id: _id,
          email: update.email,
          signupMethod: SIGNUP_EMAIL_METHOD,
        });
        if (!sameEmailUser) {
          throw new Error('The email address dosn\'t exist.');
        }
      }

      if (update.phoneNumber && user.signupMethod === SIGNUP_PHONE_METHOD) {
        try {
          const samePhoneUser = await this.model.findOne({
            _id: _id,
            'phoneNumber.phoneNumber': update.phoneNumber,
            signupMethod: SIGNUP_PHONE_METHOD,
          });

          if (!samePhoneUser) {
            throw new Error('The phone number doesn\'t exist.');
          }
        } catch (e) {
          throw new Error(e.message);
        }
      }

      if (
        (this.context.user._id.toString() == _id.toString() ||
          this.context.user.role === 'admin') &&
        (update.email || update.phoneNumber) &&
        (update.password || update.fullname)
      ) {
        let firebaseUpdate: { password?: string; fullname?: string } = {};
        if (update.password) {
          firebaseUpdate.password = update.password;
        }

        if (update.fullname) {
          firebaseUpdate.fullname = update.fullname;
        }

        await auth.updateUser(user.firebaseId, firebaseUpdate);
      }

      if (user.signupMethod === SIGNUP_EMAIL_METHOD) {
        delete update.email;
      }

      if (user.signupMethod === SIGNUP_PHONE_METHOD) {
        delete update.phoneNumber;
      }

      //const finalUser = await this.model.findOneAndUpdate({ _id: _id }, update);
      if (update.phoneNumber) {
        const verifiedNumber = await this.twilioService.verifyNumber(
          update.phoneNumber
        );
        update.phoneNumber = verifiedNumber;
      }

      const newUser = await this.model.findOneAndUpdate({ _id: _id }, update);

      return {
        code: 200,
        success: true,
        user: newUser,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async create({ user }) {
    try {
      if (isEmpty(user.email) && isEmpty(user.phoneNumber)) {
        throw new Error('Email or phoneNumber required');
      }

      if (!ProviderTypes.includes(user.providerType)) {
        throw new Error('not allowed providertype');
      }

      if (user.username) {
        const tempUser = await this.model.findOne({
          username: user.username,
        });

        if (tempUser) {
          throw new Error('User name exists');
        }
      }

      if (user.phoneNumber) {
        try {
          const verifiedNumber = await this.twilioService.verifyNumber(
            user.phoneNumber
          );

          const firebaseInfo = await auth.getUser(user.firebaseId);
          if (firebaseInfo) {
            if (firebaseInfo.phoneNumber != user.phoneNumber) {
              throw new Error('Phone number doesn \'t exisit in fireabase');
            }
          }

          user.phoneNumber = verifiedNumber;

          await auth.updateUser(firebaseInfo.uid, {
            password: user.password,
            displayName: user.fullname,
            disabled: false,
          });

          user.signupMethod = SIGNUP_PHONE_METHOD;
          user.phoneVerified = true;
        } catch (e) {
          throw new Error(e.message);
        }
      } else if (!user.firebaseId && !user.email) {
        throw new Error(
          'You need to supply either a `firebaseId`, `phoneNumber` or an `email`+`password` pair to create a user'
        );
      } else if (user.email) {
        const sameEmailUser = await this.model.findOne({
          email: user.email,
          providerType: user.providerId,
        });

        if (sameEmailUser) {
          throw new Error('User with this `email` already exists');
        }

        const firebaseInfo = await auth.getUser(user.firebaseId);

        if (firebaseInfo) {
          if (
            !firebaseInfo.providerData ||
            !firebaseInfo.providerData.length ||
            !firebaseInfo.providerData[0].email
          ) {
            throw new Error('Firebase data format is wrong!');
          }

          if (
            firebaseInfo.providerData[0].email !== user.email &&
            firebaseInfo.providerData[0].providerId !== user.providerType
          ) {
            throw new Error('Email and firebase Id don\'t match');
          }
        } else {
          throw new Error('Email doesn\'t exist in firebase');
        }

        user.signupMethod = SIGNUP_EMAIL_METHOD;
        await auth.updateUser(firebaseInfo.uid, {
          password: user.password,
          displayName: user.fullname,
          emailVerified: true,
          disabled: false,
        });
      }

      const newUser = await this.model.create(user);
      await newUser.save();

      return {
        code: 200,
        success: true,
        user: newUser,
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

const userDataSource = {
  users: new UserDataSource(UserModel),
};

const userResolver = {
  UserRole,
  User: {
    comments(user, _, { dataSources: { comments } }) {
      return comments.batch.load({ user: user._id });
    },
    bookmarks(user, _, { dataSources: { bookmarks } }) {
      return bookmarks.batch.load({ user: user._id });
    },
  },
  Query: {
    me(_, args: void, { dataSources: { users } }): User {
      return users.me();
    },
    users(
      _: void,
      args: UserQuery,
      { dataSources: { users } },
      info: GraphQLResolveInfo
    ): [User] {
      return users.list(args, fieldsList(info));
    },
    user(
      _: void,
      { _id }: { _id: ObjectId },
      { dataSources: { users } }
    ): User {
      return users.get(_id);
    },
    countUsers(_: void, args: UserQuery, { dataSources: { users } }): number {
      return users.count(args);
    },
    nearByUserCount(_: void, args: void, { dataSources: { users } }): User {
      return users.nearByCount();
    },
    requestVerifyPhone(_: void, args: void, { dataSources: { users } }) {
      return users.requestVerifyPhone();
    },
  },
  Mutation: {
    updateUser(
      _: void,
      args: UpdateUserInput,
      { dataSources: { users } }
    ): UpdateUserResponse {
      return users.update(args);
    },
    createUser(
      _: void,
      args: UpdateUserInput,
      { dataSources: { users } }
    ): UpdateUserResponse {
      return users.create(args);
    },
  },
};

export { userResolver, userDataSource, UserModel };
