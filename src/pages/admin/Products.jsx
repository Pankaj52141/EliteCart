import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export default function Products() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", image: "" });
  const [showRemove, setShowRemove] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const snap = await getDocs(collection(db, "products"));
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "products"), { ...form });
    setForm({ name: "", price: "", category: "", image: "" });
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setForm({ name: product.name, price: product.price, category: product.category, image: product.image });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "products", editId), { ...form });
    setEditId(null);
    setForm({ name: "", price: "", category: "", image: "" });
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter(p => p.id !== id));
  };

  // Filtering
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === "price") {
      valA = Number(valA);
      valB = Number(valB);
    } else {
      valA = (valA || "").toString().toLowerCase();
      valB = (valB || "").toString().toLowerCase();
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-pink-500">Product Management</h1>
      <form onSubmit={handleAdd} className="max-w-lg mx-auto space-y-4 mb-8">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" required type="number" className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
        <input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20" />
        <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-xl text-white font-bold">Add Product</button>
      </form>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or category..."
          className="px-4 py-2 rounded bg-white/10 text-white border border-white/20 w-full md:w-1/3"
        />
        <div className="flex gap-2 items-center">
          <label className="text-gray-300">Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2 py-1 rounded bg-white/10 text-white border border-white/20">
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="category">Category</option>
          </select>
          <button
            type="button"
            className="px-2 py-1 rounded bg-pink-600 text-white font-bold"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 border-solid"></div>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">No products found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse bg-white/5 rounded-xl shadow-xl">
            <thead>
              <tr className="bg-pink-900/30">
                <th className="px-4 py-2 text-pink-300">Name</th>
                <th className="px-4 py-2 text-pink-300">Price</th>
                <th className="px-4 py-2 text-pink-300">Category</th>
                <th className="px-4 py-2 text-pink-300">Image</th>
                <th className="px-4 py-2 text-pink-300">Delete</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(product => (
                <tr key={product.id} className="border-b border-white/10">
                  <td className="px-4 py-2 text-white font-medium">{product.name}</td>
                  <td className="px-4 py-2 text-gray-300">₹{product.price}</td>
                  <td className="px-4 py-2 text-pink-200 font-semibold">{product.category}</td>
                  <td className="px-4 py-2">
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-xs font-bold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-50"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="text-pink-400 font-bold">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded bg-gray-700 text-white font-bold disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
