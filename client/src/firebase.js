// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-8b3a6.firebaseapp.com",
  projectId: "real-estate-8b3a6",
  storageBucket: "real-estate-8b3a6.appspot.com",
  messagingSenderId: "763543249582",
  appId: "1:763543249582:web:a7ca00d13129353498433f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
