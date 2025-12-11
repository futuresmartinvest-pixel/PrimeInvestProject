import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// -----------------------------
// LOAD USER DATA
// -----------------------------
export async function loadVIPStatus(callback) {
  const user = auth.currentUser;
  if (!user) return callback({ loggedIn: false });

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) return callback(null);

  callback(snap.data());
}

// -----------------------------
// USER PRESSES "ACTIVATE VIP"
// -----------------------------
export async function requestVIP() {
  const user = auth.currentUser;

  if (!user) {
    alert("Please log in first.");
    return;
  }

  const uid = user.uid;
  const email = user.email;

  // -----------------------------------------
  // 0. Ensure user document exists
  // -----------------------------------------
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: email,
      vipStatus: "none",
      balance: 0,
      referredUsers: []
    });
  }

  // -----------------------------------------
  // 1. Prevent duplicate pending requests
  // -----------------------------------------
  const q = query(
    collection(db, "vipRequests"),
    where("userId", "==", uid),
    where("status", "==", "pending")
  );

  const existing = await getDocs(q);

  if (!existing.empty) {
    alert("Your VIP request is already pending.");
    return;
  }

  // -----------------------------------------
  // 2. Update user's VIP status → pending
  // -----------------------------------------
  await updateDoc(userRef, {
    vipStatus: "pending"
  });

  // -----------------------------------------
  // 3. Create new VIP request
  // -----------------------------------------
  await addDoc(collection(db, "vipRequests"), {
    userId: uid,
    email: email,
    status: "pending",
    timestamp: Date.now()
  });

  alert("Your VIP activation request has been sent to the admin.");
}

// -----------------------------
// INITIALIZE VIP PAGE
// -----------------------------
export function initVIPPage() {
  const btn = document.getElementById("activateVIP");
  const statusBox = document.getElementById("vipStatusText");

  if (!btn) return;

  btn.addEventListener("click", requestVIP);

  loadVIPStatus((data) => {
    if (!data) return;

    switch (data.vipStatus) {

      // MATCHES ADMIN APPROVAL STATUS NOW
      case "approved":
      case "active":
        statusBox.innerText = "Your VIP is active ✔️";
        btn.style.display = "none";
        break;

      case "pending":
        statusBox.innerText = "VIP request pending ⏳";
        btn.disabled = true;
        break;

      case "rejected":
        statusBox.innerText =
          "Your VIP request was rejected ❌\nYou may try again.";
        btn.disabled = false;
        break;

      default:
        statusBox.innerText = "VIP not activated.";
        btn.disabled = false;
    }
  });
}
