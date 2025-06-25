
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDCMcZ6QUeofVy8cyZu2I4kyGwGZ0b_KVg",
  authDomain: "gestao-connect.firebaseapp.com",
  projectId: "gestao-connect",
  storageBucket: "gestao-connect.firebasestorage.app",
  messagingSenderId: "463529039566",
  appId: "1:463529039566:web:23e7b6b704b1b27cdb629f",
  measurementId: "G-ZQ4RZ077C7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);