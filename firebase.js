import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1HZLZRY9UADNnDVBnoBIlG3b-bCkojxs",
  authDomain: "primeinvestproject2.firebaseapp.com",
  projectId: "primeinvestproject2",
  storageBucket: "primeinvestproject2.firebasestorage.app",
  messagingSenderId: "798977477628",
  appId: "1:798977477628:web:c97d1fba72ad7865864079"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
