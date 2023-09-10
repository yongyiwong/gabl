if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config();
}

const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path')

const app = express();
const port = process.env.LANDING_PORT || 3004;

app.use(morgan('combined'));
app.use(compression());

app.use('/', express.static(path.join(__dirname, 'public')))

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
