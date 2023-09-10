import mongoose, { Model, Document } from 'mongoose';
import { BaseDataSource } from '../BaseDataSource';
import { transformQuery } from '../../helpers/query';
import { TwilioService } from '../../services/twilio';
import { ObjectId } from 'mongodb';
import { fieldsList } from 'graphql-fields-list';
import { GraphQLResolveInfo } from 'graphql';
import {
  Conversation,
  ConversationUser,
  ConversationQuery,
  CreateConversationInput,
  CreateConversationResponse,
  DeleteParticipantInput,
} from '../../../shared/types';
import { PostType } from '../Post';

const ConversationStatusType = {
  ACTIVE: 'active',
  REMOVED: 'deleted',
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const UserPostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  participantId: {
    type: String,
    required: true,
  },
});

const ConversationSchema = new mongoose.Schema(
  {
    users: [UserPostSchema],
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      index: true,
    },
    conversationId: {
      type: String,
      index: true,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: ConversationStatusType,
      index: true,
      required: true,
      default: ConversationStatusType.ACTIVE,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const ConversationModel: Model<Conversation & Document> = mongoose.model<
  Conversation & Document
>('Conversation', ConversationSchema);

class ConversationDataSource extends BaseDataSource<Conversation & Document> {
  twilioService;

  initialize(config) {
    super.initialize(config);

    this.twilioService = new TwilioService();
  }

  async myConversations(fields) {
    return await this.list(
      {
        query: {
          'users._id': { $in: [this.context.user._id.toString()] },
        },
        sort: { createdAt: -1 },
      },
      fields
    );
  }

  async create({ post, owner, user }, session) {
    try {
      if (!session) {
        throw new Error('Transaction Session is not provided');
      }

      if (
        await this.model.findOne({
          post, // assume this is not undefined because of previous check
        })
      ) {
        throw new Error('This Ask already has a connected conversation');
      }

      const postDocument = await this.context.dataSources.posts.get(post);
      if (!postDocument) {
        throw new Error('No Ask exists');
      }

      const twilioConversation = await this.twilioService.createConversation({
        friendlyName:
          postDocument.title || postDocument.body || 'Conversation Room',
      });

      const participantOwner = await this.twilioService.createParticipant({
        conversationId: twilioConversation.sid,
        userId: owner,
      });

      const participantUser = await this.twilioService.createParticipant({
        conversationId: twilioConversation.sid,
        userId: user,
      });

      const users = [
        {
          userId: owner.toString(),
          participantId: participantOwner.sid,
        },
        {
          userId: user.toString(),
          participantId: participantUser.sid,
        },
      ];

      const conversation = {
        owner,
        users: users,
        conversationId: twilioConversation.sid,
      };

      await this.model.create([conversation], {
        session,
      });

      return {
        code: 200,
        success: true,
        conversation: conversation,
      };
    } catch (e) {
      console.log('POST ERROR here', e.message);
      throw new Error(e.message);
    }
  }

  async join({ owner, post, user }, session) {
    try {
      let newConversation = await this.model.findOne({ owner, post });

      if (!newConversation) {
        throw new Error('No coversation exists');
      }

      const userId = user || this.context.user._id.toString();

      if (
        newConversation.users &&
        newConversation.users.find((user) => user?.userId === userId.toString())
      ) {
        throw new Error('You have already connected to this ask');
      }

      const participant = await this.twilioService.createParticipant({
        conversationId: newConversation.conversationId,
        userId: userId,
      });

      newConversation.users = (newConversation.users || []).concat({
        userId: userId,
        participantId: participant.sid,
      });

      await newConversation.save({ session });

      return {
        code: 200,
        success: true,
        conversation: newConversation,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  async deleteParticipant({ participant }) {
    const session = await mongoose.connection.startSession();
    try {
      let newConversation = await this.model.findOne({
        post: participant.post,
      });

      if (!newConversation) {
        throw new Error('No coversation exists');
      }

      if (this.context.user.role === 'admin') {
        const deleteUser = newConversation.users.filter(
          (user) => user.userId === participant.user
        );

        await session.withTransaction(async () => {
          if (deleteUser && deleteUser.length) {
            await this.twilioService.deleteParticipant({
              conversationId: newConversation.conversationId,
              participantId: deleteUser[0].participantId,
            });
          }

          newConversation.users = newConversation.users.filter(
            (user) => user.userId !== participant.user
          );

          await newConversation.save({ session });
        });
      } else {
        throw new Error('No permission to delete');
      }
      session.endSession();
      return {
        code: 200,
        success: true,
        conversation: newConversation,
      };
    } catch (e) {
      session.endSession();
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }
}

const conversationDataSource = {
  conversations: new ConversationDataSource(ConversationModel),
};

const commonResolver = {
  async users(conversation, _, { dataSources: { users } }) {
    const userIds = conversation.users.map((user) => user._id);
    const userList = await users.batch.load({ _id: { $in: userIds } });
    return userList.map((u) => {
      const participant = conversation.users.filter(
        (user) => user._id === u._id.toString()
      );
      return {
        ...u,
        participantId:
          participant && participant.length
            ? participant[0].participantId
            : null,
      };
    });
  },

  post(conversation, _, { dataSources: { posts } }) {
    return posts.get(conversation.post);
  },

  async participants(conversation) {
    try {
      const participants = await client.conversations.v1
        .conversations(conversation.conversationId)
        .participants.list({ limit: 20 });

      return participants;
    } catch (e) {
      console.log('Error for getting participants', e.message);
      return [];
    }
  },
};

const conversationResolver = {
  ConversationStatusType,
  Conversation: {
    __resolveType(obj) {
      return '';
    },
  },

  Query: {
    myConversations(
      _: void,
      args,
      { dataSources: { conversations } },
      info: GraphQLResolveInfo
    ) {
      return conversations.myConversation(fieldsList(info));
    },
    conversation(_: void, { _id }, { dataSources: { conversations } }) {
      return conversations.get(_id);
    },
    conversations(_: void, args, { dataSources: { conversations } }) {
      return conversations.list(args);
    },
  },

  Mutation: {
    deleteParticipant(
      _: void,
      args: DeleteParticipantInput,
      { dataSources: { conversations } }
    ): CreateConversationResponse {
      return conversations.deleteParticipant(args);
    },
  },
};

module.exports = {
  ConversationStatusType,
  ConversationModel,
  conversationResolver,
  conversationDataSource,
};
