import { MongoDataSource } from 'apollo-datasource-mongodb';
import mongoose, { Model, Document } from 'mongoose';
import DataLoader from 'dataloader';
import sift from 'sift';
import { transformQuery } from '../helpers/query';
import { UserRole } from './User';

export type JSON<T> = { [K in keyof T]: T[K] };

export type ListQuery<T, U> = {
  query: T;
  limit?: number;
  skip?: number;
  sort?: U;
};
type FindOption = Omit<ListQuery<any, any>, 'query'>;

class BaseDataSource<T> extends MongoDataSource<T> {
  batch: DataLoader<T, T>;
  initialize(config) {
    super.initialize(config);
    this.batch = new DataLoader((queries) => this.batchFind(queries));
  }

  exists(query) {
    return this.model.exists(transformQuery(query));
  }

  async count({ query }) {
    return this.model.countDocuments(transformQuery(query));
  }

  async list(args: ListQuery<any, any>, fields) {
    let option: FindOption = {};
    if (args.limit) option.limit = args.limit;
    if (args.skip) option.skip = args.skip;
    if (args.sort) option.sort = args.sort;

    return await this.model
      .find(transformQuery(args?.query), fields, option)
      .lean();
  }

  get(_id) {
    return this.findOneById(_id);
  }

  async batchFind(queries) {
    const transformedQueries = queries.map((q) => transformQuery(q));
    const results = await this.model.find({ $or: transformedQueries }).lean();

    return transformedQueries.map((query) => results.filter(sift(query)));
  }

  async delete({ _id }) {
    try {
      const document = await this.model.findById(_id);

      if (this.context.user.role !== UserRole.ADMIN) {
        // eslint-disable-next-line quotes
        throw new Error("Can't delete : user doesn't match");
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

export { BaseDataSource };
