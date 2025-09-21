import React, { useState, useEffect } from "react";
import { FaCheck, FaExclamationTriangle, FaTimes, FaInfoCircle } from "react-icons/fa";

const Toast = ({ 
  message, 
  type = "success", 
  duration = 3000, 
  onClose,
  position = "top-right" 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="text-green-400" />;
      case "error":
        return <FaTimes className="text-red-400" />;
      case "warning":
        return <FaExclamationTriangle className="text-yellow-400" />;
      case "info":
        return <FaInfoCircle className="text-blue-400" />;
      default:
        return <FaCheck className="text-green-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600/20 border-green-600/30";
      case "error":
        return "bg-red-600/20 border-red-600/30";
      case "warning":
        return "bg-yellow-600/20 border-yellow-600/30";
      case "info":
        return "bg-blue-600/20 border-blue-600/30";
      default:
        return "bg-green-600/20 border-green-600/30";
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "top-center":
        return "top-4 left-1/2 transform -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] max-w-sm w-full`}>
      <div
        className={`
          ${getBackgroundColor()}
          backdrop-blur-lg border rounded-lg p-4 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isExiting 
            ? 'translate-x-full opacity-0' 
            : 'translate-x-0 opacity-100'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <p className="text-white text-sm font-medium">{message}</p>
          </div>
          
          <button
            onClick={() => {
              setIsExiting(true);
              setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
              }, 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-white transition"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 3000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration + 300);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
          position="top-right"
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    warning: (message, duration) => showToast(message, "warning", duration),
    info: (message, duration) => showToast(message, "info", duration)
  };
};

export default Toast;