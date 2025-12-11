import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

  // 1. Update user's VIP status to pending
  await updateDoc(doc(db, "users", uid), {
    vipStatus: "pending",
  });

  // 2. Create VIP request in vipRequests collection
  await setDoc(doc(db, "vipRequests", uid), {
    userId: uid,
    email: email,
    status: "pending",
    createdAt: Date.now(),
  });

  alert(
    "Your VIP activation request has been sent.\nAdmin will approve it shortly."
  );
}

// -----------------------------
// USED BY VIP PAGE UI
// -----------------------------
export function initVIPPage() {
  const btn = document.getElementById("activateVIP");

  if (!btn) return;

  btn.addEventListener("click", () => {
    requestVIP();
  });

  loadVIPStatus((data) => {
    if (!data) return;

    const statusBox = document.getElementById("vipStatusText");

    switch (data.vipStatus) {
      case "approved":
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
        break;

      default:
        statusBox.innerText = "VIP not activated.";
    }
  });
}
