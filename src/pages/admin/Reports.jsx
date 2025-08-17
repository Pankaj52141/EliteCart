import React from "react";

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-red-400">Sales Reports</h1>
      <p className="mb-4 text-gray-400">Generate and view sales reports.</p>
      {/* Report generation features go here */}
      <div className="bg-white/10 rounded-xl p-6 shadow-xl">
        <p className="text-gray-300">No reports generated. Connect to backend or Firebase to generate reports.</p>
      </div>
    </div>
  );
}
