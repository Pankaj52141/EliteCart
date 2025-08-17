// src/components/ui/Button.jsx

import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}) {
  const baseClasses =
    "px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md focus:outline-none";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${className} focus:ring-2 focus:ring-blue-400 focus:ring-offset-2`}
      disabled={disabled}
      aria-label={typeof children === 'string' ? children : undefined}
      tabIndex={0}
    >
      {children}
    </button>
  );
}
