// ----------------------------
// Import Firebase modules
// ----------------------------
import { auth, db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";


// ----------------------------
// Load and Show Wallet Balance
// ----------------------------
export async function loadWallet() {
  const user = auth.currentUser;
  if (!user) return alert("Please login first.");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    console.error("User data missing!");
    return;
  }

  const data = snap.data();

  document.getElementById("balanceAmount").innerText =
    (data.balance ?? 0).toFixed(2);
}


// ----------------------------
// Load Transaction History
// ----------------------------
export async function loadHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const list = document.getElementById("historyList");
  list.innerHTML = "Loading...";

  const q = query(
    collection(db, "transactions"),
    where("userID", "==", user.uid)
  );

  const snap = await getDocs(q);

  list.innerHTML = "";

  snap.forEach((docSnap) => {
    const t = docSnap.data();
    const item = document.createElement("div");
    item.className = "history-card";

    item.innerHTML = `
      <p><b>${t.type.toUpperCase()}</b> — £${t.amount.toFixed(2)}</p>
      <p>Status: <b>${t.status}</b></p>
      <p>${t.timestamp?.toDate().toLocaleString() ?? ""}</p>
      <hr>
    `;

    list.appendChild(item);
  });
}


// ----------------------------
// Request Withdrawal
// ----------------------------
export async function requestWithdrawal() {
  const user = auth.currentUser;
  if (!user) return alert("Please login first.");

  const amount = parseFloat(prompt("Enter withdraw amount (£):"));

  if (!amount || amount <= 0) return;

  // Create withdrawal request
  await addDoc(collection(db, "transactions"), {
    userID: user.uid,
    type: "withdraw",
    amount,
    status: "pending",
    timestamp: serverTimestamp()
  });

  alert("Withdrawal request sent for admin approval.");
  loadHistory();
}


// ----------------------------
// Auto-update after login
// ----------------------------
auth.onAuthStateChanged(() => {
  loadWallet();
  loadHistory();
});
