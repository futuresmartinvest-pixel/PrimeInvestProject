import { auth, db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// -----------------------------
// ADMIN UID (Insert yours)
// -----------------------------
const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";

// -----------------------------
// CHECK IF ADMIN
// -----------------------------
export function checkAdmin() {
  if (!auth.currentUser) {
    alert("You must log in as admin.");
    window.location.href = "login.html";
    return;
  }

  if (auth.currentUser.uid !== ADMIN_UID) {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
  }
}

// -----------------------------
// LOAD ALL VIP REQUESTS (LIVE)
// -----------------------------
export function loadVIPRequests(callback) {
  const vipRef = collection(db, "vipRequests");

  onSnapshot(vipRef, (snapshot) => {
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    callback(requests);
  });
}

// -----------------------------
// APPROVE VIP
// -----------------------------
export async function approveVIP(request) {
  try {
    // Update user VIP status
    await updateDoc(doc(db, "users", request.userId), {
      vipStatus: "approved"
    });

    // Delete the request
    await deleteDoc(doc(db, "vipRequests", request.id));

    alert("VIP Approved!");
  } catch (e) {
    alert("Error approving VIP: " + e.message);
  }
}

// -----------------------------
// REJECT VIP
// -----------------------------
export async function rejectVIP(request) {
  try {
    // Update user status
    await updateDoc(doc(db, "users", request.userId), {
      vipStatus: "rejected"
    });

    // Delete the VIP request
    await deleteDoc(doc(db, "vipRequests", request.id));

    alert("VIP Request Rejected.");
  } catch (e) {
    alert("Error rejecting VIP: " + e.message);
  }
}
