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
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// -----------------------------
// SIGN UP USER (GLOBAL)
// -----------------------------
export async function signUpUser(fullName, email, password, referralCode) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName });

    // Create user in Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName: fullName,
      email: email,
      referralCode: referralCode || null,
      referredUsers: [],
      balance: 0,
      vipStatus: "pending",
      createdAt: new Date()
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
// Redirects user automatically
// -----------------------------
export function initAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in → fetch Firestore data
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
