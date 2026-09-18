import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuQK7d4TBAWGXosTpHuqsNWSLcO6xhQ5Y",
  authDomain: "emergencydbms.firebaseapp.com",
  projectId: "emergencydbms",
  storageBucket: "emergencydbms.firebasestorage.app",
  messagingSenderId: "773585850218",
  appId: "1:773585850218:web:739135f34b1f1edde6df13",
  measurementId: "G-L7RDPC5QCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app);
