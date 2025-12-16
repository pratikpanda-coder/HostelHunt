import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAOKTqpJmN-43fDQrZVmfGCVlK_8JBTrvY",
  authDomain: "hostelhunt-1df83.firebaseapp.com",
  databaseURL: "https://hostelhunt-1df83-default-rtdb.firebaseio.com",
  projectId: "hostelhunt-1df83",
  storageBucket: "hostelhunt-1df83.appspot.com",
  messagingSenderId: "272376261500",
  appId: "1:272376261500:web:719ada3e6b22090c5b12f9",
  measurementId: "G-0G66K64YFS"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);