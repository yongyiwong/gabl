const admin = require('firebase-admin');

const serviceAccount = require('../config/firebase-config.json');

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const messaging = firebase.messaging();

module.exports = {
  firebase,
  messaging
};
