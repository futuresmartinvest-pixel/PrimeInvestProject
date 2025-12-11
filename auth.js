// -----------------------------
// ADMIN UID (Set Your Admin User ID Here)
// -----------------------------
export const ADMIN_UID = "za934MEck4Qd3IK2pHqplS6WPBe2";

import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ------------------------------------
// GENERATE USER REFERRAL CODE
// ------------------------------------
function generateReferralCode(uid) {
  return uid.substring(0, 6).toUpperCase();
}

// ------------------------------------
// SIGN UP USER (GLOBAL)
// ------------------------------------
export async function signUpUser(fullName, email, password, referredByCode = null) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    const referralCode = generateReferralCode(user.uid);

    let referredBy = null;

    // -----------------------------------------
    // If referral code exists → find referring user
    // -----------------------------------------
    if (referredByCode) {
      const usersRef = doc(db, "referralCodes", referredByCode);
      const refSnap = await getDoc(usersRef);

      if (refSnap.exists()) {
        referredBy = refSnap.data().uid;

        // Add this user to referredUsers of the inviter
        await updateDoc(doc(db, "users", referredBy), {
          referredUsers: [user.uid],
        });
      }
    }

    // -----------------------------------------
    // Create user Firestore profile
    // -----------------------------------------
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      referralCode,
      referredBy,
      referredUsers: [],
      balance: 0,
      vipStatus: "none",     // FIXED from pending
      createdAt: Date.now(),
      role: user.uid === ADMIN_UID ? "admin" : "user"
    });

    // -----------------------------------------
    // Store referral code so others can find it
    // -----------------------------------------
    await setDoc(doc(db, "referralCodes", referralCode), {
      uid: user.uid
    });

    return { success: true, user };

  } catch (error) {
    return { success: false, message: error.message };
  }
}

// -----------------------------
// SIGN IN USER
// -----------------------------
export async function signInUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// -----------------------------
// AUTH STATE LISTENER
// -----------------------------
export function initAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      callback({
        loggedIn: true,
        user: user,
        data: userDoc.exists() ? userDoc.data() : null
      });
    } else {
      callback({ loggedIn: false });
    }
  });
}

// -----------------------------
// LOGOUT USER
// -----------------------------
export async function logoutUser() {
  await signOut(auth);
}
