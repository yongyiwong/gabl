if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const { CommentModel } = require('../models/Comment');
const { PostModel } = require('../models/Post');
const { UserModel } = require('../models/User');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 20,
});
mongoose.set('debug', true);

const EMAILS = [
  'lm.user2012@yopmail.com',
  'grishabysko@gmail.com',
  'dsgkx2xddm@privaterelay.appleid.com',
  'grishatester@meta.ua',
  'bucanovat035@gmail.com',
  'jnfr631196@gmail.com',
  'b-grifon@ukr.net',
];

const IDS = [
  ['61c080698aa34d2a77e7bdae', 'Jery 2012'],
  ['61c1ff92d82bb0a43616cae2', null],
  ['61c22131d82bb0941316dda3', 'Harrison Wilson'],
  ['61c22133d82bb035a816dde5', 'Korbi McDonald'],
  ['61c34c41d82bb05d4c16fa86', 'Grisha Bysko'],
  ['61c34e1fd82bb018be1700ae', 'Gregory'],
  ['61c34f07d82bb044d317069b', 'Grisha Bisko'],
  ['61c37b3ed82bb04fdf173dd7', 'Lord Voldemort'],
  ['61c758d1e16315c77a8b68f5', 'Yeva Maria B'],
  ['61cc8f58bdb05394b499e980', 'Hryhorii the Great'],
  ['61cd9e5bbdb053ee009a0a2f', 'Orochimary '],
  ['61cda0edbdb05337729a0a33', 'Itachi Uchiha'],
  ['61dfe2431c5eac6d3b7b0375', 'LoveIn'],
  ['61dfe8511c5eac6cd87b0598', 'Harley'],
  ['61eee41112ba9657dbebbe8d', 'Julia West'],
  ['61f46fb9742178701a2aff96', null],
  ['61f594437421784d062b3e02', null],
  ['61f7684f742178ef632b7a37', null],
  ['61f7f9dc7421783bc32b9e44', null],
];

async function seed() {
  try {
    const admin = await UserModel.findOne({ _id: '61f829bf93e95e5b1836ee8b' });

    await PostModel.updateMany(
      { type: { $ne: 'userStory' } },
      { user: admin._id }
    );
    // await CommentModel.deleteMany();
    // // console.log( comments )
    // console.log( posts );
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

seed();
