if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config();
}
const fs = require('fs');

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const useragent = require('express-useragent');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const fileUpload = require('express-fileupload');

const firebaseAuth = require('./middleware/firebase-auth');
const routes = require('./routes');

const app = express();
const port = process.env.MEDIASERVICE_PORT || 3003;

const whitelist = [
  'http://limitlessminds.local:3000',
  'https://limitlessminds.local:3000',
  'https://limitlessminds.local:3001',
  'https://limitlessminds.local:3003',
  'https://stage-api.limitlessminds.app',
  'https://api.limitlessminds.app',
  'https://stage-admin.limitlessminds.app',
  'https://admin.limitlessminds.app',
];

mongoose.connect( process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, poolSize: 20 });
mongoose.set('debug', true);

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(useragent.express());
app.use(cookieParser());
app.use(compression());
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if ( typeof origin === 'undefined' || whitelist.indexOf(origin) !== -1) {
      // console.log( `CORS Allowed for ${ origin }`);
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${ origin }`));
    }
  }
}));

app.use(firebaseAuth);
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/',
  debug: true
}));

routes(app);

if ( process.env.NODE_ENV !== 'production') {
  const https = require('https');
  const key = fs.readFileSync('./cert/circa.local-key.pem');
  const cert = fs.readFileSync('./cert/circa.local.pem');

  https.createServer({key, cert}, app)
    .listen(port)
    .on('listening', () => {
      console.log(`🚀 Server ready at https://limitlessminds.local:${ port }`);
    });
} else {
  app
    .listen(port)
    .on('listening', () => {
      console.log(`[ API ] Docker process up. Port: ${port}`);
    } );
}
