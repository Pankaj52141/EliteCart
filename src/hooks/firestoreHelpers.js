import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

// 🔹 Get Orders for Logged-in User
export const getOrdersForUser = async (userId) => {
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

// 🔹 Get Recommendations for User
export const getRecommendations = async (userId) => {
  const q = query(collection(db, "recommendations"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

// 🔹 Get User Role
export const getUserRole = async (userId) => {
  const q = query(collection(db, "users"), where("uid", "==", userId));
  const snapshot = await getDocs(q);
  const data = snapshot.docs[0]?.data();
  return data?.role || "user";
};
