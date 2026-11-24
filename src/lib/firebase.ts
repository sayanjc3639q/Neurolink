import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD9xz8PriVjEXwXfqpAkPEXFV5TIdFt0VY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'neurolink-390bf.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'neurolink-390bf',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'neurolink-390bf.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '405300287284',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:405300287284:web:bb5383fdaa0b81ad833761',
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with persistent offline cache
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const auth: Auth = getAuth(app);

// Connect to emulators if specified or if running in local dev emulator mode
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  } catch (err) {
    console.warn('Emulators already connected or connection failed', err);
  }
}

// Hardcode default fallback admin UID so it always recognizes you even without .env reloading
export const OWNER_UID =
  (import.meta.env.VITE_OWNER_UID || '').trim() || 'w8MTO5DEg0Miiz8RWCck5tfkE7R2';
