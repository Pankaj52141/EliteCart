import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ displayName: "", email: "", role: "user" });

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ displayName: user.displayName, email: user.email, role: user.role });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "users", editId), { ...form });
    setEditId(null);
    setForm({ displayName: "", email: "", role: "user" });
    // Refresh users
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", id));
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">User Management</h1>
      <form onSubmit={handleUpdate} className="max-w-lg mx-auto space-y-4 mb-8">
        {editId && (
          <>
            <input name="displayName" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} placeholder="Name" required className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
            <input name="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" required className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
            <select name="role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-white font-bold">Update User</button>
            <button type="button" onClick={() => { setEditId(null); setForm({ displayName: "", email: "", role: "user" }); }} className="w-full mt-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-xl text-white font-bold">Cancel Edit</button>
          </>
        )}
      </form>
      {loading ? <div className="text-center text-gray-400">Loading...</div> : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map(user => (
            <div key={user.id} className="bg-white/10 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-2">{user.displayName}</h2>
              <p className="text-gray-300 mb-1">{user.email}</p>
              <p className="text-gray-400 mb-2">Role: {user.role}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(user)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">Edit</button>
                <button onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
