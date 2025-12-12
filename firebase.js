// Firebase v10 CDN imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA1HZLZRY9UADNnDVBnoBIlG3b-bCkojxs",
  authDomain: "primeinvestproject2.firebaseapp.com",
  projectId: "primeinvestproject2",
  storageBucket: "primeinvestproject2.firebasestorage.app",
  messagingSenderId: "798977477628",
  appId: "1:798977477628:web:c97d1fba72ad7865864079"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
