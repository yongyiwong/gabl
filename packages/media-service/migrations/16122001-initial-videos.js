/* eslint-disable */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const { generateFilename } = require('../routes/video');

const { PostModel } = require('../models/Post');

//  id of post and video name
const ASSOCIATIONS = [
  {
    _id: '61bb43ba311f683280e87d8b',
    filename: 'Values vs Goals.mp4'
  },
  {
    _id: '61bb4446311f6837cbe87de9',
    filename: '10000000_1724457634400743_8191036657153947855_n.mp4'
  },
]

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 20
});
mongoose.set('debug', true);

/**
 *  This migration is necessary because of added tags caching on
 *  create and update for Tips. Older Tips don't have tags cached for
 *  them, thus this script;
 * */
async function run() {
  try {

    await Promise.all( ASSOCIATIONS.map( async ({ _id, filename }) => {
      const { responseData } = generateFilename(filename)

      await PostModel.updateOne({ _id }, {
        media: [ responseData ]
      })
    } ) )
  } catch (e) {
    console.error(e);
  }

  process.exit();
}

run();
