// -----------------------------------------------------
// IMPORTS (Firebase v10 CDN)
// -----------------------------------------------------
import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// -----------------------------------------------------
// LOAD USER VIP STATUS
// -----------------------------------------------------
export async function loadVIPStatus(callback) {
  const user = auth.currentUser;
  if (!user) return callback({ loggedIn: false });

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    return callback({ loggedIn: false });
  }

  const data = snap.data();

  callback({
    loggedIn: true,
    vip: data.vip || false,
    vipRequested: data.vipRequested || false
  });
}

// -----------------------------------------------------
// REQUEST VIP ACTIVATION (User clicks button)
// -----------------------------------------------------
export async function requestVIP() {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in");

  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    vipRequested: true
  });

  // Save message in VIP requests collection for admin to see
  await addDoc(collection(db, "vip_requests"), {
    uid: user.uid,
    email: user.email,
    requestedAt: new Date(),
    approved: false
  });

  alert("VIP request sent! Admin must approve it.");
}

// -----------------------------------------------------
// INITIALIZE VIP PAGE
// -----------------------------------------------------
export function initVIPPage() {
  const vipBox = document.getElementById("vipStatus");
  const vipBtn = document.getElementById("vipButton");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      vipBox.innerHTML = "<p>Please log in to access VIP.</p>";
      return;
    }

    loadVIPStatus((status) => {
      if (!status.loggedIn) {
        vipBox.innerHTML = "<p>Unable to load VIP data.</p>";
        return;
      }

      // Already VIP
      if (status.vip === true) {
        vipBox.innerHTML = "<p>🎉 You are a VIP member!</p>";
        vipBtn.style.display = "none";
        return;
      }

      // Already requested
      if (status.vipRequested === true) {
        vipBox.innerHTML = "<p>⏳ VIP request pending...</p>";
        vipBtn.style.display = "none";
        return;
      }

      // Show button
      vipBox.innerHTML = "<p>You are not VIP</p>";
      vipBtn.style.display = "block";

      vipBtn.onclick = requestVIP;
    });
  });
}
