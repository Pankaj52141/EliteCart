export default function OrderCard({ order }) {
  return (
    <div className="flex items-center justify-between bg-white/10 px-6 py-4 rounded-lg shadow-md">
      <div>
        <h4 className="font-semibold text-white">Order #{order.orderId}</h4>
        <p className="text-gray-300 text-sm">₹{order.amount} - {order.status}</p>
      </div>
      <button className="text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
        View
      </button>
    </div>
  );
}
