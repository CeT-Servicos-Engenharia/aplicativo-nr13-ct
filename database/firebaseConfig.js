import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwNzPILwF8S019k8byN-dCDYg2LaB0iiA",
  authDomain: "nr13-c33f2.firebaseapp.com",
  projectId: "nr13-c33f2",
  storageBucket: "nr13-c33f2.firebasestorage.app",
  messagingSenderId: "579131593328",
  appId: "1:579131593328:web:92951a4b93a79f40da9ab5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };

