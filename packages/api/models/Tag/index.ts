import mongoose, { Model, Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { fieldsList } from 'graphql-fields-list';
import { MongoDataSource } from 'apollo-datasource-mongodb';
import { upperFirst, omit, toLower } from 'lodash';
import { transformQuery } from '../../helpers/query';
import { gql } from 'apollo-server-express';
import { GraphQLResolveInfo } from 'graphql';
import { BaseDataSource, ListQuery } from '../BaseDataSource';

import {
  Tag,
  TagQuery,
  TagSort,
  CreateTagInput,
  CreateTagResponse,
} from '../../../shared/types';

const TagSchema = new mongoose.Schema(
  {
    order: Number,
    slug: {
      type: String,
      index: true,
      required: true,
    },
    displayName: String,
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const TagModel: Model<Tag & Document> = mongoose.model<Tag & Document>(
  'Tag',
  TagSchema
);

class TagDataSource extends BaseDataSource<Tag & Document> {
  async list(
    { query, limit, skip, sort }: ListQuery<TagQuery & { order: any }, TagSort>,
    fields
  ) {
    if (query && !query.all) {
      query.order = { $ne: null };
    }

    return this.model.find(transformQuery(omit(query, ['all'])), fields, {
      limit,
      skip,
      sort,
    });
  }

  get(_id) {
    return this.findOneById(_id);
  }

  async create(user, { tag }) {
    try {
      tag = {
        ...tag,
        slug: toLower(tag.slug),
      };

      const newTag = await this.model.create(tag);
      await newTag.save();

      return {
        code: 200,
        success: true,
        tag: newTag,
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

const tagDataSource = {
  tags: new TagDataSource(TagModel),
};

const tagResolver = {
  Tag: {
    __resolveType(obj) {
      return `${upperFirst(obj.object_type)}Tag`;
    },
    posts(tag, _: void, { dataSources: { posts } }, info: GraphQLResolveInfo) {
      return posts.list({ query: { tags: [tag._id] } }, fieldsList(info));
    },
  },
  Query: {
    tags(
      _: void,
      args: TagQuery,
      { dataSources: { tags } },
      info: GraphQLResolveInfo
    ) {
      return tags.list(args, fieldsList(info));
    },
  },
  Mutation: {
    createTag(_: void, args: TagQuery, { user, dataSources: { tags } }) {
      return tags.create(user, args);
    },
    deleteTag(_: void, _id: ObjectId, { dataSources: { tags } }) {
      console.log('deleteTag', _id);
      return tags.delete(_id);
    },
  },
};

export { tagResolver, tagDataSource, TagModel };
