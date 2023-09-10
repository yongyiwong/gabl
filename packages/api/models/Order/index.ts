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
  toUpper,
} from 'lodash';

import {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  CreateUpdateOrderResponse,
  DeleteOrderResponse,
  User,
  OrderQuery,
  OrderSort,
  OrderStatus as SchemaOrderStatus,
} from '../../../shared/types';
import { PostType } from '../Post';
import { ListQuery, BaseDataSource } from '../BaseDataSource';

enum OrderStatus {
  REQUEST = 'request', // request by user
  ACCEPT = 'accept', // accept by owner
  WITHDRAW = 'withdraw', // cancel by owner
  REJECT = 'reject', // reject by user
  COMPLETE = 'complete', // accept by owner
  EXPIRE = 'expire',
}

enum OrderStatusStep {
  REQUEST = 1,
  ACCEPT = 2,
  WITHDRAW = 3,
  REJECT = 3,
  COMPLETE = 3,
  EXPIRE = 3,
}

const OrderSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      index: true,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    body: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.REQUEST,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
  }
);

const OrderModel: Model<Order & Document> = mongoose.model<Order & Document>(
  'Order',
  OrderSchema
);

class OrderDataSource extends BaseDataSource<Order & Document> {
  async delete({ _id }: { _id: ObjectId }) {
    try {
      await this.model.deleteOne({
        _id,
        user: this.context.user._id,
        status: toLower(SchemaOrderStatus.Request),
      });
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

  async create({ order }: { order: Order }) {
    try {
      const post = await this.context.dataSources.posts.get(order.post);
      if (post.type !== PostType.ASK) {
        throw new Error('You can only apply to request');
      }

      const existOrder = await this.model.findOne({
        user: this.context.user._id,
        post: post._id,
      });
      if (existOrder) {
        throw new Error('You have already applied');
      }

      order.user = this.context.user._id;
      order.owner = post.user;

      const newOrder = await this.model.create(order);

      return {
        code: 200,
        success: true,
        order: newOrder,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    }
  }

  static async excuteExpire(orders: OrderDataSource): Promise<Boolean> {
    await orders.model.updateMany(
      {
        status: toLower(SchemaOrderStatus.Request),
        created_at: {
          $lte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      { status: toLower(SchemaOrderStatus.Expire) }
    );
    return true;
  }

  async statusValidate(_id, status) {
    const order = await this.get(_id);

    if (
      +OrderStatusStep[toUpper(order.status)] >=
      +OrderStatusStep[toUpper(status)]
    ) {
      return false;
    }
    return true;
  }

  async update({ _id, update }: { _id: ObjectId; update: Order }) {
    const session = await mongoose.connection.startSession();
    try {
      let updatedOrder = null;

      if (!(await this.statusValidate(_id, update.status))) {
        throw new Error('You are note in proper state to update');
      }

      if (
        [OrderStatus.REQUEST, OrderStatus.REJECT].includes(
          toLower(update.status.toString())
        )
      ) {
        updatedOrder = await this.model.findOneAndUpdate(
          { _id, user: this.context.user._id },
          update,
          { new: true }
        );
      }

      if (
        [
          OrderStatus.ACCEPT,
          OrderStatus.COMPLETE,
          OrderStatus.WITHDRAW,
        ].includes(toLower(update.status.toString()))
      ) {
        await session.withTransaction(async () => {
          updatedOrder = await this.model.findOneAndUpdate(
            { _id, owner: this.context.user._id },
            update,
            { new: true, session }
          );

          //if owner accepts, need to create chat room to discuss
          if (OrderStatus.ACCEPT === toLower(update.status.toString())) {
            await this.context.dataSources.conversations.create(
              {
                owner: updatedOrder.owner,
                user: updatedOrder.user,
                post: updatedOrder.post,
              },
              session
            );
          }

          if (OrderStatus.COMPLETE === toLower(update.status.toString())) {
            await this.context.dataSources.users.increasePoint(
              updatedOrder.user,
              session
            );
          }
        });
      }
      return {
        code: 200,
        success: true,
        order: updatedOrder,
      };
    } catch (e) {
      return {
        code: 501,
        success: false,
        message: e.message,
      };
    } finally {
      session.endSession();
    }
  }
}

const orderDataSource = {
  orders: new OrderDataSource(OrderModel),
};

const orderResolver = {
  OrderStatus,
  Order: {
    user(order: Order, _: void, { dataSources: { users } }) {
      return users.get(order.user);
    },
    owner(order: Order, _: void, { dataSources: { users } }) {
      return users.get(order.owner);
    },
    post(order: Order, _: void, { dataSources: { posts } }) {
      return posts.get(order.post);
    },
  },

  Query: {
    orders(
      _: void,
      args: ListQuery<OrderQuery, OrderSort>,
      { user, dataSources: { orders } },
      info: GraphQLResolveInfo
    ): [Order] {
      return orders.list(args, fieldsList(info));
    },
    myOrders(
      _: void,
      args: ListQuery<OrderQuery, OrderSort>,
      { user, dataSources: { orders } },
      info: GraphQLResolveInfo
    ): [Order] {
      args = {
        ...args,
        query: {
          ...(args.query
            ? { ...args.query, user: user._id }
            : { user: user._id }),
        },
      };
      return orders.list(args, fieldsList(info));
    },
    order(
      _: void,
      { _id }: { _id: ObjectId },
      { dataSources: { orders } }
    ): Order {
      return orders.get(_id);
    },
    countPosts(_: void, args: OrderQuery, { dataSources: { orders } }): Number {
      return orders.count(args);
    },
  },

  Mutation: {
    deleteOrder(
      _: void,
      args: ObjectId,
      { dataSources: { orders } }
    ): DeleteOrderResponse {
      return orders.delete(args);
    },
    updateOrder(
      _: void,
      args: CreateOrderInput,
      { dataSources: { orders } }
    ): CreateUpdateOrderResponse {
      return orders.update(args);
    },
    createOrder(
      _: void,
      args: CreateOrderInput,
      { dataSources: { orders } }
    ): CreateUpdateOrderResponse {
      return orders.create(args);
    },
    manualExpire(
      _: void,
      args: void,
      { dataSources: { orders } }
    ): Promise<Boolean> {
      return OrderDataSource.excuteExpire(orders);
    },
  },
};

const scheduleOrderExpire = () => {
  const time = {
    hour: 0,
    minute: 0,
    tz: 'Etc/UTC',
  };

  schedule('orderExpire', time, () => {
    OrderDataSource.excuteExpire(orderDataSource.orders);
  });
};

export { orderDataSource, orderResolver, scheduleOrderExpire };
