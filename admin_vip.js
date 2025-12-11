import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// YOUR ADMIN UID (ONLY YOU CAN OPEN THIS PAGE)
const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";

document.getElementById("adminUID").textContent = ADMIN_UID;

// Listen for login state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to access admin panel.");
    window.location.href = "index.html";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("ACCESS DENIED — You are not the admin.");
    window.location.href = "index.html";
    return;
  }

  loadVIPRequests();
});

// Load all VIP requests
async function loadVIPRequests() {
  const container = document.getElementById("requests");
  container.innerHTML = "Loading…";

  const snapshot = await getDocs(collection(db, "vipRequests"));

  if (snapshot.empty) {
    container.innerHTML = "<p>No pending requests.</p>";
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
}

// APPROVE VIP
window.approveVIP = async function (docId, userId) {
  try {
    // Update user VIP status
    await updateDoc(doc(db, "users", userId), {
      vipStatus: "active"
    });

    // Remove request
    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Approved!");
    loadVIPRequests();
  } catch (err) {
    alert("Error approving VIP: " + err.message);
  }
};

// REJECT VIP
window.rejectVIP = async function (docId, userId) {
  try {
    // Update user VIP status
    await updateDoc(doc(db, "users", userId), {
      vipStatus: "rejected"
    });

    // Remove request
    await deleteDoc(doc(db, "vipRequests", docId));

    alert("VIP Rejected!");
    loadVIPRequests();
  } catch (err) {
    alert("Error rejecting VIP: " + err.message);
  }
};
