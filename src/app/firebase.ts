import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBXF4W7NQ5PuqYOB0pUB5Fp4D8CVRhqN4",
  authDomain: "forkfusion-72916.firebaseapp.com",
  projectId: "forkfusion-72916",
  storageBucket: "forkfusion-72916.appspot.com",
  messagingSenderId: "699313516081",
  appId: "1:699313516081:web:189d8c181878f76523ef10",
  measurementId: "G-FCJYLQGQ31"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };