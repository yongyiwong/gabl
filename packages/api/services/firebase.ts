import admin from 'firebase-admin';
import { FirebaseDynamicLinks } from 'firebase-dynamic-links';

const serviceAccount = require('../config/firebase-config.json');
const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const messaging = firebase.messaging();
const auth = firebase.auth();

const getDynamicLink = async (deepLinkUrl) => {
  const firebaseDynamicLinks = new FirebaseDynamicLinks(
    process.env.FIREBASE_WEB_KEY
  );

  const { shortLink } = await firebaseDynamicLinks.createLink({
    dynamicLinkInfo: {
      domainUriPrefix: process.env.DOMAIN_PREFIX,
      link: deepLinkUrl,
      androidInfo: {
        androidPackageName: process.env.ANDROID_PACKAGE_NAME,
      },
      iosInfo: {
        iosBundleId: process.env.IOS_BUNDLE_ID,
      },
    },
  });
  return shortLink;
};

export { firebase, messaging, auth, getDynamicLink };
