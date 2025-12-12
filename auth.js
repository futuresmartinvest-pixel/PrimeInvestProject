// ------------------------------
// ADMIN UID (Set Your Admin User ID Here)
// ------------------------------
export const ADMIN_UID = "3xM6WyDqPTVkX0L4sOTNQ8f4VWO2"; // your admin UID

// ------------------------------
// Firebase Imports (v10 CDN)
// ------------------------------
import { app, db } from "./firebase.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Initialize Auth
export const auth = getAuth(app);

// ------------------------------
// REGISTER USER
// ------------------------------
export async function registerUser(email, password, name) {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    // Update display name
    await updateProfile(userCred.user, { displayName: name });

    // Create user document
    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      vip: false,
      vipRequested: false,
      wallet: 0,
      tasksCompleted: 0
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ------------------------------
// LOGIN USER
// ------------------------------
export async function loginUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ------------------------------
// LOGOUT USER
// ------------------------------
export function logoutUser() {
  return signOut(auth);
}

// ------------------------------
// CHECK LOGIN STATE
// ------------------------------
export function watchAuthState(callback) {
  onAuthStateChanged(auth, callback);
}
