/* eslint-disable */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

/**
 *  This script should initialize the db from scratch with only very basic things.
 *
 *  Basic test USERS
 *
 *  For the purposes of this and further projects, all other things should be seeded from different scripts
 *  to minimize time it takes to initialize any project that spins-off from this
 *
 * */
const mongoose = require('mongoose');
const hplipsum = require('hplipsum');
const { sample, random, chunk } = require('lodash');

const { firebase } = require('../services/firebase');

const { UserModel } = require('../models/User');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 20,
});
mongoose.set('debug', true);

// eslint-disable-next-line no-unused-vars
//
//  Change of approach as of gabl:
//
//  Instead of relying on hardcoded list of users, sync with
//  firebase instead. This will ensure that uids are also synced
//  each time and we don't have mismatch between local and stage/prod
//
const USERS = [
  {
    email: 'yurii@synapps.agency',
    role: 'admin',
    fullname: 'Yurii Sichkovskyi',
    username: 'yuriisynapps',
    picture: {
      type: 'picture',
      src: 'https://gravatar.com/avatar/1227ee8adaaf2605d00810d8c1e4a32a',
    },
  },
  {
    email: 'roman@synapps.agency',
    role: 'admin',
    fullname: 'Roman Savchuk',
    username: 'rsavchuk',
  },
  {
    email: 'admin@gabl.app',
    role: 'admin',
    fullname: 'GABL Admin',
    username: 'admin1',
  },
];

const listAllUsers = (nextPageToken) => {
  const users = [];
  // List batch of users, 1000 at a time.
  return firebase
    .auth()
    .listUsers(1000, nextPageToken)
    .then((listUsersResult) => {
      users.push(...listUsersResult.users);

      if (listUsersResult.pageToken) {
        // List next batch of users.
        return listAllUsers(listUsersResult.pageToken);
      }
    })
    .then(() => {
      return users;
    })
    .catch((error) => {
      console.log('Error listing users:', error);
    });
};

async function seed() {
  try {
    //  Clear everything
    await UserModel.deleteMany({ role: { $ne: 'coach' } });

    const users = await listAllUsers();

    const augUsers = users.map((user) => {
      const preDefinedRoles = USERS.find((u) => u.email === user.email);

      if (preDefinedRoles) {
        return {
          ...preDefinedRoles,
          firebaseId: user.uid,
        };
      } else {
        return {
          email: user.email,
          firebaseId: user.uid,
          fullname: user.displayName || 'Anonymous',
          role: 'user',
        };
      }
    });

    await UserModel.insertMany(augUsers);

    // const admin = await UserModel.findOne({ role: 'admin' });
    // const user = await UserModel.findOne({ username: 'rsavchuk-user' });
    // const user2 = await UserModel.findOne({ username: 'rokas-user' });

    // const comments = [];
    // const articles = [];

    // Splits?
    // for (let i = 0; i <= 20; i++) {
    //   const post = await PostModel.create({
    //     type: 'article',
    //     user: admin._id,
    //     title: hplipsum(5),
    //     body: hplipsum(50, 5),
    //     media: [ sample( ARTICLE_MEDIA ) ],
    //     author: sample([ coach1, coach2 ])
    //   });

    //   await post.save();

    //   articles.push( post._id )

    //   for (let i = 0; i <= 5; i++) {
    //     const theUser = sample([ user, user2 ]);

    //     comments.push({
    //       user: theUser._id,
    //       post: post._id,
    //       body: hplipsum(10),
    //     });
    //   }
    // }

    // await CommentModel.insertMany( comments );
  } catch (e) {
    console.error(e);
  }

  process.exit();
}

seed();
