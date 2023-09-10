/* global require */
const fs = require('fs');
const https = require('https');
const express = require('express');
const next = require('next');

const port = process.env.WEB_PORT || 3000;
const app = next({ dev: process.env.NEXT_DEV });
const handle = app.getRequestHandler();

(async () => {
  await app.prepare();
  const server = express();

  server.all('*', (req, res) => handle(req, res));

  const key = fs.readFileSync('./cert/beautyselect.local-key.pem');
  const cert = fs.readFileSync('./cert/beautyselect.local.pem');

  https.createServer({key, cert}, server)
    .listen(port)
    .on('listening', () =>
      console.log(`Feathers server listening on ${process.env.WEB_URL}`)
    );
})();
