// src/hooks/getUserRole.js
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserRole = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().role || "user";
  }
  return "user";
};
