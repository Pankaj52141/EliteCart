import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft, FaDownload, FaTruck, FaBox, FaCheck, FaCheckCircle, FaClock, FaMapMarkerAlt, FaTimes, FaRedo } from "react-icons/fa";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  // Mock tracking timeline data
  const getTrackingTimeline = (status) => {
    const timeline = [
      {
        status: "Order Placed",
        date: order?.createdAt?.toDate?.() || new Date(),
        completed: true,
        icon: FaBox,
        description: "Your order has been placed successfully"
      },
      {
        status: "Confirmed",
        date: order?.confirmedAt || new Date(Date.now() + 1000 * 60 * 30), // 30 min later
        completed: ["Confirmed", "Processing", "Shipped", "Out for Delivery", "Delivered"].includes(status),
        icon: FaCheck,
        description: "Order confirmed and being prepared"
      },
      {
        status: "Processing",
        date: order?.processingAt || new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours later
        completed: ["Processing", "Shipped", "Out for Delivery", "Delivered"].includes(status),
        icon: FaClock,
        description: "Your order is being processed"
      },
      {
        status: "Shipped",
        date: order?.shippedAt || new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day later
        completed: ["Shipped", "Out for Delivery", "Delivered"].includes(status),
        icon: FaTruck,
        description: "Your order has been shipped"
      },
      {
        status: "Out for Delivery",
        date: order?.outForDeliveryAt || new Date(Date.now() + 1000 * 60 * 60 * 48), // 2 days later
        completed: ["Out for Delivery", "Delivered"].includes(status),
        icon: FaMapMarkerAlt,
        description: "Your order is out for delivery"
      },
      {
        status: "Delivered",
        date: order?.deliveredAt || new Date(Date.now() + 1000 * 60 * 60 * 72), // 3 days later
        completed: status === "Delivered",
        icon: FaCheckCircle,
        description: "Your order has been delivered"
      }
    ];

    return timeline;
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const orderData = docSnap.data();
          // Check if user owns this order or is admin
          if (orderData.userId !== user?.uid && user?.role !== "admin") {
            setError("You don't have permission to view this order.");
            setLoading(false);
            return;
          }
          setOrder({ id: orderId, ...orderData });
        } else {
          setError("Order not found.");
        }
      } catch (e) {
        setError("Failed to fetch order.");
      }
      setLoading(false);
    }
    
    if (user) {
      fetchOrder();
    }
  }, [orderId, user]);

  const handleCancelOrder = async () => {
    if (!order || order.status === "Delivered" || order.status === "Shipped") {
      return;
    }

    setCancelLoading(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Cancelled",
        cancelledAt: new Date(),
        cancelledBy: user.uid
      });
      setOrder(prev => ({ ...prev, status: "Cancelled", cancelledAt: new Date() }));
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
    setCancelLoading(false);
  };

  const handleReturnOrder = async () => {
    if (!order || order.status !== "Delivered") {
      return;
    }

    setReturnLoading(true);
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Return Requested",
        returnRequestedAt: new Date(),
        returnRequestedBy: user.uid
      });
      setOrder(prev => ({ ...prev, status: "Return Requested", returnRequestedAt: new Date() }));
    } catch (error) {
      console.error("Error requesting return:", error);
    }
    setReturnLoading(false);
  };

  const downloadInvoice = () => {
    // Mock invoice download
    const invoiceData = {
      orderId: order.id,
      date: order.createdAt?.toDate?.() || new Date(),
      items: order.items,
      total: order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0,
      address: order.address,
      paymentMethod: order.paymentMethod
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `invoice-${order.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button 
            onClick={() => navigate("/profile")}
            className="bg-pink-600 hover:bg-pink-700 px-6 py-2 rounded-lg"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const timeline = getTrackingTimeline(order.status);
  const canCancel = order.status === "Pending" || order.status === "Confirmed";
  const canReturn = order.status === "Delivered";
  const total = order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <FaArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-pink-500">Order Details</h1>
            <p className="text-gray-400">Order #{order.id.slice(-8)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Tracking Timeline */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-pink-400">Order Tracking</h2>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === "Delivered" ? "bg-green-600" :
                order.status === "Cancelled" ? "bg-red-600" :
                order.status === "Return Requested" ? "bg-yellow-600" :
                "bg-blue-600"
              }`}>
                {order.status}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {timeline.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? "bg-pink-600 text-white" : "bg-gray-600 text-gray-400"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${step.completed ? "text-white" : "text-gray-400"}`}>
                          {step.status}
                        </h3>
                        <span className="text-gray-400 text-sm">
                          {step.date.toLocaleDateString()} {step.date.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated Delivery */}
            {order.status !== "Delivered" && order.status !== "Cancelled" && (
              <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2">Estimated Delivery</h3>
                <p className="text-gray-300">
                  {new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toLocaleDateString()} - {new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Date</span>
                  <span>{order.createdAt?.toDate?.()?.toLocaleDateString() || "Recent"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-green-400">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Items</span>
                  <span>{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-3">
                  <span>Total</span>
                  <span className="text-pink-400">₹{total}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={downloadInvoice}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <FaDownload />
                  Download Invoice
                </button>

                {canCancel && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelLoading}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <FaTimes />
                    {cancelLoading ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}

                {canReturn && (
                  <button
                    onClick={handleReturnOrder}
                    disabled={returnLoading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <FaRedo />
                    {returnLoading ? "Requesting..." : "Request Return"}
                  </button>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold text-pink-400 mb-4">Shipping Address</h3>
              <div className="text-gray-300">
                <p>{order.address}</p>
                <p>Pincode: {order.pincode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-pink-400 mb-6">Order Items</h3>
          <div className="space-y-4">
            {order.items && order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white/10 rounded-lg">
                <img
                  src={item.imageUrl || "/placeholder-product.jpg"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{item.name}</h4>
                  <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-pink-400">₹{item.price}</p>
                  <p className="text-gray-400 text-sm">₹{item.price * item.quantity} total</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-pink-400 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold mb-2">Track Your Order</h4>
              <p className="text-gray-400 text-sm">Get real-time updates on your order status</p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold mb-2">Return Policy</h4>
              <p className="text-gray-400 text-sm">Easy returns within 30 days of delivery</p>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <h4 className="font-semibold mb-2">Customer Support</h4>
              <p className="text-gray-400 text-sm">24/7 support via chat, email, or phone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
