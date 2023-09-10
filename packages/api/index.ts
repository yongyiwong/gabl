import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import fs from 'fs';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
// const useragent = require('express-useragent');
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import firebaseAuth from './middleware/firebase-auth';
import {init as schedulerInit} from './services/scheduler';
import https from 'https';
import apolloServer from './services/apollo';

const app = express();
const port = process.env.API_PORT || 3001;

const whitelist = [
  'http://gabl.local:3000',
  'https://gabl.local:3000',
  'https://gabl.local:3001',
  'https://gabl.local:3003',
  'https://stage-api.gabl.app',
  'https://api.gabl.app',
  'https://stage-admin.gabl.app',
  'https://admin.gabl.app',
  'https://studio.apollographql.com',
];

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 20,
});
mongoose.set('debug', process.env.NODE_ENV === 'development');

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(useragent.express());
app.use(cookieParser());
app.use(compression());
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      if (typeof origin === 'undefined' || whitelist.indexOf(origin) !== -1) {
        // console.log( `CORS Allowed for ${ origin }`);
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
  })
);

app.use(firebaseAuth);

schedulerInit();

async function start() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  if (process.env.NODE_ENV !== 'production') {
    const key = fs.readFileSync('./cert/gabl.local-key.pem');
    const cert = fs.readFileSync('./cert/gabl.local.pem');

    https
      .createServer({ key, cert }, app)
      .listen(port)
      .on('listening', () => {
        console.log(
          `🚀 Server ready at https://gabl.local:${port}${apolloServer.graphqlPath}`
        );
      });
  } else {
    app.listen(port).on('listening', () => {
      console.log(`[ API ] Docker process up. Port: ${port}`);
    });
  }
}

start();
