const isEmpty = require('lodash/isEmpty');
const { firebase } = require('../services/firebase');
const { UserModel } = require('../models/User');

async function authMiddleware(req, res, next) {
  const headerToken = req.headers.authorization;
  const apiKey = req.query.apiKey || req.headers.apiKey;

  if (
    process.env.NODE_ENV !== 'production' ||
    (apiKey && apiKey === process.env.API_KEY)
  ) {
    req.user = await UserModel.findOne(
      { email: 'yurii@synapps.agency' },
      '_id role firebaseId'
    )
      .lean()
      .exec();
    next();
    return;
  }

  if (!headerToken) {
    return res.send({ message: 'No token provided' }).status(401);
  }

  if (headerToken && headerToken.split(' ')[0] !== 'Bearer') {
    res.send({ message: 'Invalid token' }).status(401);
  }

  const token = headerToken.split(' ')[1];

  try {
    const auth = await firebase.auth().verifyIdToken(token);
    req.user = await UserModel.findOne({ firebaseId: auth.user_id }, '_id role firebaseId')
      .lean()
      .exec();

    if (isEmpty(req.user) && req.body.operationName !== 'createUser') {
      res.send({ message: "User doesn't exist" }).status(401);
    }

    next();
  } catch (e) {
    console.log(e);
    res.send({ message: 'Could not authorize' }).status(403);
  }
}

module.exports = authMiddleware;
