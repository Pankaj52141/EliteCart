export default function RecommendationCard({ item }) {
  return (
    <div className="bg-white/10 rounded-xl p-6 shadow-xl hover:scale-[1.02] transition-all">
      <h4 className="text-lg font-bold mb-2">{item.name}</h4>
      <p className="text-gray-300">₹{item.price}</p>
      <a
        href={`/product/${item.id}`}
        className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
      >
        View Product
      </a>
    </div>
  );
}
