// Remplacez les valeurs ci-dessous par la configuration de votre application Web Firebase.
// Firebase Web API keys are public identifiers; protect data with Firestore and Storage rules.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';

export const firebaseConfig = {
   apiKey: "AIzaSyDX8dIcLyABeJ-SE3a7uLEo4aaTC2lbI40",
  authDomain: "chikenhouseabidjan.firebaseapp.com",
  projectId: "chikenhouseabidjan",
  storageBucket: "chikenhouseabidjan.firebasestorage.app",
  messagingSenderId: "472248026360",
  appId: "1:472248026360:web:c8c802e81a174c48c0a70d"
};

export const firebaseConfigured = !Object.values(firebaseConfig).some(value => value.startsWith('REMPLACER_'));

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
