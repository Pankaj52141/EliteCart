// src/hooks/getOrdersByUserId.js
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getOrdersByUserId = async (userId) => {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
