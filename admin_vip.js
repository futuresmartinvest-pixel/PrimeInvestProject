import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ----------------------------
// ADMIN UID (ONLY YOU)
// ----------------------------
const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";
document.getElementById("adminUID").textContent = ADMIN_UID;

// ----------------------------
// AUTH CHECK
// ----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must log in first.");
    location.href = "index.html";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("ACCESS DENIED — Admin only.");
    location.href = "index.html";
    return;
  }

  // If admin, load VIP requests live
  loadVIPRequests();
});

// ----------------------------
// REAL-TIME VIP REQUESTS
// ----------------------------
function loadVIPRequests() {
  const container = document.getElementById("requests");
  container.innerHTML = "Loading…";

  // Only show pending requests
  const q = query(collection(db, "vipRequests"), where("status", "==", "pending"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      container.innerHTML = "<p>No pending VIP requests.</p>";
      return;
    }

    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const box = document.createElement("div");
      box.className = "request-box";

      box.innerHTML = `
        <p><strong>User ID:</strong> ${data.userId}</p>
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Requested At:</strong> ${new Date(data.timestamp).toLocaleString()}</p>

        <button class="btn approve" onclick="approveVIP('${docSnap.id}', '${data.userId}')">Approve</button>
        <button class="btn reject" onclick="rejectVIP('${docSnap.id}', '${data.userId}')">Reject</button>
      `;

      container.appendChild(box);
    });
  });
}

// ----------------------------
// APPROVE VIP
// ----------------------------
window.approveVIP = async function (docId, userId) {
  try {
    await updateDoc(doc(db, "users", userId), { vipStatus: "active" });
    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Approved!");
  } catch (err) {
    alert("Error approving VIP: " + err.message);
  }
};

// ----------------------------
// REJECT VIP
// ----------------------------
window.rejectVIP = async function (docId, userId) {
  try {
    await updateDoc(doc(db, "users", userId), { vipStatus: "rejected" });
    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Rejected!");
  } catch (err) {
    alert("Error rejecting VIP: " + err.message);
  }
};
