import { gql } from 'apollo-server-express';
import { union, difference, isEqual } from 'lodash';

import { messaging } from '../../services/firebase';

function handleFirebaseResponse(firebaseResponse) {
  if (firebaseResponse.failureCount > 0) {
    return {
      code: 500,
      success: false,
      firebaseResponse,
    };
  } else {
    return {
      code: 200,
      success: true,
      firebaseResponse,
    };
  }
}

function handleError(error) {
  return {
    code: 501,
    sucess: false,
    message: error.message,
  };
}
const messagingResolver = {
  Mutation: {
    subscribe: async function (
      _,
      { tokens, resubscribe },
      { user, dataSources: { users, habitSubscriptions } }
    ) {
      try {
        let newTokens = union(user.fcmTokens || [], tokens);
        const firebaseResponse = await messaging.subscribeToTopic(
          newTokens,
          'general'
        );

        if (firebaseResponse.failureCount > 0) {
          firebaseResponse.errors.every((invalidToken) => {
            newTokens.splice(invalidToken.index, 1);
          });
        }

        if (!isEqual(user.fcmTokens, newTokens)) {
          await users.model.updateOne(
            { _id: user._id },
            { fcmTokens: newTokens }
          );
        }

        if (resubscribe !== false) {
          const resubscribeResponse = await habitSubscriptions.resubscribe(
            newTokens,
            user
          );

          resubscribeResponse
            .reject((r) => r == null)
            .every((res) => {
              firebaseResponse.failureCount =
                firebaseResponse.failureCount + res.failureCount;
              firebaseResponse.errors.push(...res.errors);
            });
        }

        return handleFirebaseResponse(firebaseResponse);
      } catch (e) {
        return handleError(e);
      }
    },
    unsubscribe: async function (
      _,
      { tokens },
      { user, dataSources: { users } }
    ) {
      try {
        const diffTokens = difference(user.fcmTokens || [], tokens);
        const firebaseResponse = await messaging.unsubscribeFromTopic(
          tokens,
          'general'
        );

        if (firebaseResponse.failureCount === 0 && tokens) {
          await users.model.updateOne(
            { _id: user._id },
            { fcmTokens: diffTokens }
          );
        }

        return handleFirebaseResponse(firebaseResponse);
      } catch (e) {
        return handleError(e);
      }
    },
  },
};

export { messagingResolver };
