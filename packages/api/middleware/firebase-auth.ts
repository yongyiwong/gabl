import { isEmpty } from 'lodash';
import { firebase } from '../services/firebase';
import { UserModel } from '../models/User';

const OperationsWithoutAuth = [
  '{posts(',
  '{post(',
  '{categories(',
  '{categories{',
  '{createUser(',
];

async function authMiddleware(req, res, next) {
  const headerToken = req.headers.authorization;
  const apiKey = req.query.apiKey || req.headers.apiKey;

  const q = req.body.query || '';

  const isOperatorWithNoToken = OperationsWithoutAuth.some((element) => {
    return q.replace(/\s/g, '').includes(element);
  });

  if (
    process.env.NODE_ENV !== 'production' ||
    (apiKey && apiKey === process.env.API_KEY)
  ) {
    req.user = await UserModel.findOne(
      {
        email: { $in: ['yongyi.fullstack@gmail.com', 'yurii@synapps.agency'] },
      },
      '_id role fcmTokens phoneNumber location'
    )
      .lean()
      .exec();
    next();
    return;
  }

  if (!headerToken) {
    if (isOperatorWithNoToken) {
      req.unauthenticated = true;

      req.user = await UserModel.findOne(
        {
          email: {
            $in: ['yongyi.fullstack@gmail.com', 'yurii@synapps.agency'],
          },
        },
        '_id role fcmTokens phoneNumber location'
      )
        .lean()
        .exec();
      next();
      return;
    }
    return res.send({ message: 'No token provided' }).status(401);
  }

  if (headerToken && headerToken.split(' ')[0] !== 'Bearer') {
    res.send({ message: 'Invalid token' }).status(401);
  }

  const token = headerToken.split(' ')[1];

  try {
    const auth = await firebase.auth().verifyIdToken(token);
    req.user = await UserModel.findOne(
      { firebaseId: auth.user_id },
      '_id role fcmTokens phoneNumber location'
    )
      .lean()
      .exec();

    if (isEmpty(req.user) && req.body.operationName !== 'createUser') {
      res.send({ message: 'User doesn\'t exist' }).status(401);
    }

    next();
  } catch (e) {
    console.log(e);
    res.send({ message: 'Could not authorize' }).status(403);
  }
}

export = authMiddleware;
