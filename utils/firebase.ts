
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCutZ4-S27z8DzRQQnREMDLKdP-b3zV95s",
  authDomain: "cricketpredition-5a66d.firebaseapp.com",
  projectId: "cricketpredition-5a66d",
  storageBucket: "cricketpredition-5a66d.firebasestorage.app",
  messagingSenderId: "980647942349",
  appId: "1:980647942349:web:8e2100fdc783723623b184"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper to get token
export const getRemoteToken = async () => {
  try {
    const docRef = doc(db, "config", "auth");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().token;
    }
    return null;
  } catch (e) {
    console.error("Firebase fetch error:", e);
    return null;
  }
};

// Helper to set token
export const setRemoteToken = async (token: string) => {
  try {
    const docRef = doc(db, "config", "auth");
    await setDoc(docRef, { token, updatedAt: new Date().toISOString() });
    return true;
  } catch (e) {
    console.error("Firebase save error:", e);
    return false;
  }
};
