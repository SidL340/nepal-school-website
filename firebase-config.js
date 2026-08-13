// ─── firebase-config.js ──────────────────────────────────────────────────────
// Shared Firebase initialization — included on every public page + admin panel
// Uses Firebase Compat SDK v9 (works without npm/build tools, via CDN)
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyD0-OAeAAXI6irXO2msUvqF2RqOPVheuuw",
  authDomain: "nepal-school-website.firebaseapp.com",
  projectId: "nepal-school-website",
  storageBucket: "nepal-school-website.firebasestorage.app",
  messagingSenderId: "1040299047198",
  appId: "1:1040299047198:web:b06f451c075e0c7e5e710f",
  measurementId: "G-752Q0YK9RP"
};

// Guard against double-initialization (safe to include on multiple pages)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
// Enable offline persistence so data loads instantly from cache without lag
if (db.enablePersistence) {
  db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence disabled: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported by current browser');
    }
  });
}

const storage = firebase.storage ? firebase.storage() : null;
const auth    = firebase.auth ? firebase.auth() : null;

