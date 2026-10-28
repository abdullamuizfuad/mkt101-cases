/* MKT101 Arena: the ONE place for the Firebase web config (public, safe to commit).
   CLOUD_ON is the single switch. Turned on after the Firestore rules were published
   (python3 tools/build-rules.py <class list>, then Firebase console → Firestore → Rules → Publish).
   While it is false the site runs in device-only mode: vendor/firebase.js is never loaded.
   Tests against the Firebase emulators force it on with ?emu=1 on localhost. */
const CLOUD_ON=true;
const CLOUD_CONFIG={
  apiKey:"AIzaSyCfOWu4EsdP8rINht0_FJZVBxeObcv59y0",
  authDomain:"mkt101-arena.firebaseapp.com",
  projectId:"mkt101-arena",
  storageBucket:"mkt101-arena.firebasestorage.app",
  messagingSenderId:"1054434034798",
  appId:"1:1054434034798:web:39956c8349a47db10b127f"
};
