import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8G2hFgPkzXDi9qJ7KjiTwqI4Zf6iQbpA",
  authDomain: "baguio-pinelodge.firebaseapp.com",
  projectId: "baguio-pinelodge",
  storageBucket: "baguio-pinelodge.firebasestorage.app",
  messagingSenderId: "838870993935",
  appId: "1:838870993935:web:b2214b1ae3f4a96d4ce77a",
  measurementId: "G-0ZQFBKFV3K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);