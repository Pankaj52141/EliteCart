// src/components/ui/Card.jsx
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-lg ${className}`}
      tabIndex={0}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </div>
  );
};

export { Card };
