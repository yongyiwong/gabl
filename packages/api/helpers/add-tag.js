if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config();
}

const mongoose = require('mongoose');

const { TagModel } = require('../models/Tag');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });
mongoose.set('debug', true);

const TAGS = [
  {
    order: 2,
    slug: 'essentials'
  }
];

async function seed() {
  try {
    await TagModel.insertMany( TAGS );
  }catch(e) {
    console.log(e);
  }
  process.exit();
}

seed();
