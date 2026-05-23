/// <reference types="vite/client" />
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Your Firebase Web App config — get these from:
// Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "panadev-3069.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "panadev-3069",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "panadev-3069.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/** Sign in with Google popup and return the user + ID token */
async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const token = await result.user.getIdToken();
  return { user: result.user, token };
}

/** Get the current user's ID token (auto-refreshed by Firebase) */
async function getAuthToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

/** Sign out */
async function firebaseSignOut() {
  return signOut(auth);
}

export { auth, googleProvider, signInWithGoogle, getAuthToken, firebaseSignOut };
