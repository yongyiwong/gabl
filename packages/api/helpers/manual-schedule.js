if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config({ path: '../.env' });
}

const mongoose = require('mongoose');
const { fetchManually } = require('../models/Split');

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });
mongoose.set('debug', true);

async function run() {
  await fetchManually();

}

run();
