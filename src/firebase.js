// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAlzUeYPdKFlTDwkWO5Xt_9foN3BwmbpK0",
  authDomain: "ecommerce-ceedd.firebaseapp.com",
  projectId: "ecommerce-ceedd",
  storageBucket: "ecommerce-ceedd.firebasestorage.app",
  messagingSenderId: "648987887287",
  appId: "1:703324097833:web:4d360994fd52b1f14c7b38"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { auth, db, storage };


