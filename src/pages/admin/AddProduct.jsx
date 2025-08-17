import React, { useState } from "react";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add product logic here (e.g., send to Firebase)
    alert("Product added (demo only)");
    setName("");
    setPrice("");
    setCategory("");
    setImage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">Add New Product</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20"
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10 text-white border border-white/20"
        />
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-xl text-black font-bold">
          Add Product
        </button>
      </form>
    </div>
  );
}
