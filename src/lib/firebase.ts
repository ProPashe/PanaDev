/// <reference types="vite/client" />
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";

// Your Firebase Web App config
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyDmljHApLRxzju-xz3aflFzfBGmxV72O1E",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "panadev-3069.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "panadev-3069",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "panadev-3069.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "447151002114",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:447151002114:web:d341f4ca6147d765d2cd1b",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/** Initiate Google sign-in redirect — result is captured in checkRedirectResult */
async function signInWithGoogle() {
  await signInWithRedirect(auth, googleProvider);
}

/** Call on app load to capture the result after a Google redirect sign-in */
async function checkRedirectResult() {
  const result = await getRedirectResult(auth);
  if (!result) return null;
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

export { auth, googleProvider, signInWithGoogle, checkRedirectResult, getAuthToken, firebaseSignOut };
