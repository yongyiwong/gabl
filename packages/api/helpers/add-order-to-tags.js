if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const { TagModel } = require('../models/Tag');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });
mongoose.set('debug', true);

const TAGS = [
  [ { slug: 'chunking', }, { order: 0 } ],
  [ { slug: 'mental-chatter', }, { order: 1 } ],
  [ { slug: 'reality-check', }, { order: 2 } ],
  [ { slug: 'control-check', }, { order: 3 } ],
  [ { slug: 'attention-shift', }, { order: 4 } ],
];

async function seed() {
  try {
    for (let i = 0; i < TAGS.length; i++) {
      const [ query, update ] = TAGS[i];

      console.log( query, update );
      await TagModel.findOneAndUpdate( query, update );
    }
  } catch (e) {
    console.error( e );
  } finally {
    process.exit();
  }
}

seed();
