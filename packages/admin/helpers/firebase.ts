import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC1cvyT89NQd47gvEjETx8sk1yXvg5OG2w',
  authDomain: 'wmonk-1342f.firebaseapp.com',
  databaseURL: 'https://wmonk-1342f.firebaseio.com',
  projectId: 'wmonk-1342f',
  storageBucket: 'wmonk-1342f.appspot.com',
  messagingSenderId: '1045806384318',
  appId: '1:1045806384318:web:8db03f161ac682d34ccaef',
  measurementId: 'G-LV2JMH3KW0',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
