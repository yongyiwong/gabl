/**
 * Not sure if this is the best way of doing things,
 * but I'm defaulting on my prior experience.
 *
 * Most other projects suggest that Apollo should be a service
 * initialized separately and index.js should be very clear and readable
 * for those who need to make sense of it
 */
import { gql, ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';

import { makeExecutableSchema } from '@graphql-tools/schema';
import { DateTimeResolver, ObjectIDResolver } from 'graphql-scalars';
import { merge } from 'lodash';

import { LruCache } from './cache';
import { azureResolver } from './azure';
import { join } from 'path';

import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { addResolversToSchema } from '@graphql-tools/schema';

const { userResolver, userDataSource } = require('../models/User');
const { eventResolver, eventDataSource } = require('../models/Event');
//  Until this is reworked into Split, should be imported
//  because it breaks Comment
const {
  scheduleFetchNews,
  postResolver,
  postDataSource,
} = require('../models/Post');
const { commentResolver, commentDataSource } = require('../models/Comment');

const {
  orderResolver,
  orderDataSource,
  scheduleOrderExpire,
} = require('../models/Order');

const {
  conversationResolver,
  conversationDataSource,
} = require('../models/Conversation');
const { tagResolver, tagDataSource } = require('../models/Tag');
const { messagingResolver } = require('../models/Messaging');

const { bookmarkResolver, bookmarkDataSource } = require('../models/Bookmark');

let typeDefs = loadSchemaSync('../**/*.gql', {
  loaders: [new GraphQLFileLoader()],
});

const resolvers = {
  DateTime: DateTimeResolver,
  ObjectId: ObjectIDResolver,
  Query: {
    ping: () => 'pong',
  },
  Mutation: {
    ping: () => 'pong',
  },
};

const dataSources = () => ({
  ...userDataSource,
  ...eventDataSource,
  ...commentDataSource,
  ...postDataSource,
  ...tagDataSource,
  ...conversationDataSource,
  ...bookmarkDataSource,
  ...orderDataSource,
});

const schema = makeExecutableSchema({
  typeDefs: [typeDefs],
  resolvers: merge(
    resolvers,
    azureResolver,
    userResolver,
    eventResolver,
    commentResolver,
    postResolver,
    tagResolver,
    messagingResolver,
    bookmarkResolver,
    conversationResolver,
    orderResolver
  ),
});

const resolverCache = new LruCache();

//  Various init tasks

scheduleFetchNews();
scheduleOrderExpire();

const apolloServer = new ApolloServer({
  schema,
  dataSources,
  context: ({ req }: any) => ({
    resolverCache,
    user: req.user,
    unauthenticated:
      req.unauthenticated !== undefined ? req.unauthenticated : undefined,
  }),
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  introspection: true,
});

export default apolloServer;
