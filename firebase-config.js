// Remplacez les valeurs ci-dessous par la configuration de votre application Web Firebase.
// Firebase Web API keys are public identifiers; protect data with Firestore and Storage rules.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';

export const firebaseConfig = {
  apiKey: "AIzaSyBxFQ6Qgwv07LVpFjOFCzv4YeG3HrhAVwQ",
  authDomain: "puff-e16f7.firebaseapp.com",
  databaseURL: "https://puff-e16f7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "puff-e16f7",
  storageBucket: "puff-e16f7.firebasestorage.app",
  messagingSenderId: "552508218564",
  appId: "1:552508218564:web:cc98c3e81bb575a41afd91"
};

export const adminEmail = 'REMPLACER_PAR_LE_MAIL_ADMIN';
export const firebaseConfigured = !Object.values(firebaseConfig).some(value => value.startsWith('REMPLACER_'))
  && !adminEmail.startsWith('REMPLACER_');

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
