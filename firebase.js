import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyA3QJPFlfkI80gVMrfrdp7ZpWw2ByuH6r0",
    authDomain: "whatsapp-2-6416a.firebaseapp.com",
    projectId: "whatsapp-2-6416a",
    storageBucket: "whatsapp-2-6416a.appspot.com",
    messagingSenderId: "99982500208",
    appId: "1:99982500208:web:8f86c9bca94c0b43542fb5"
  };

const app = !firebase.apps.length?
                firebase.initializeApp(firebaseConfig):
                firebase.app();

const db = app.firestore();
const auth = app.auth();
const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };