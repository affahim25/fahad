// js/firebase.js
// Firebase initialisation — exports db, ref, push, get

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── Firebase project config ──────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyDVEn3SvMvgGWWIUEyjAPhogknLG_GoyiA",
  authDomain:        "fahad-kazi.firebaseapp.com",
  databaseURL:       "https://fahad-kazi-default-rtdb.firebaseio.com",
  projectId:         "fahad-kazi",
  storageBucket:     "fahad-kazi.firebasestorage.app",
  messagingSenderId: "787964422549",
  appId:             "1:787964422549:web:de6abf72e5d3d4d5ba2e9c",
  measurementId:     "G-88S70GYS7P",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export { db, ref, push, get };
