// -------------------------
// Firebase v10 CDN imports
// -------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// -------------------------
// Your Firebase Config
// -------------------------
const firebaseConfig = {
  apiKey: "AIzaSyA1HZLZRY9UADNnDVBnB5nJ3mZyqqP4iY",
  authDomain: "primeinvestproject2.firebaseapp.com",
  projectId: "primeinvestproject2",
  storageBucket: "primeinvestproject2.appspot.com",
  messagingSenderId: "798977477628",
  appId: "1:798977477628:web:c97d1fbd6da6e5b585c5f1"
};

// -------------------------
// Initialize Firebase
// -------------------------
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
