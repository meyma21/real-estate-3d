import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfdlL9VzWslh0T4z0SkVoLiANQy2yyT_4",
  authDomain: "real-estate-vis-management-sys.firebaseapp.com",
  projectId: "real-estate-vis-management-sys",
  storageBucket: "real-estate-vis-management-sys.firebasestorage.app",
  messagingSenderId: "352203800167",
  appId: "1:352203800167:web:3e338017a3dda0de22dec2",
  measurementId: "G-8N946BLVT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 