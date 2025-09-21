import React from "react";

// Base Skeleton Component
const Skeleton = ({ 
  width = "100%", 
  height = "1rem", 
  className = "", 
  rounded = false,
  animate = true 
}) => {
  return (
    <div
      className={`
        bg-gray-600/30 
        ${animate ? 'animate-pulse' : ''}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={{ width, height }}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
    <Skeleton height="12rem" className="rounded-lg" />
    <div className="space-y-2">
      <Skeleton height="1.25rem" width="80%" />
      <Skeleton height="1rem" width="60%" />
      <div className="flex items-center gap-2">
        <Skeleton height="1rem" width="3rem" />
        <Skeleton height="1rem" width="4rem" />
      </div>
      <Skeleton height="2.5rem" className="rounded-lg" />
    </div>
  </div>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton height="1.5rem" width="8rem" />
      <Skeleton height="1.5rem" width="5rem" rounded />
    </div>
    <div className="space-y-2">
      <Skeleton height="1rem" width="60%" />
      <Skeleton height="1rem" width="40%" />
      <Skeleton height="1rem" width="50%" />
    </div>
    <div className="flex justify-between items-center">
      <Skeleton height="1.25rem" width="6rem" />
      <Skeleton height="2rem" width="8rem" className="rounded-lg" />
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton height="6rem" width="6rem" rounded />
      <div className="space-y-2">
        <Skeleton height="1.5rem" width="10rem" />
        <Skeleton height="1rem" width="8rem" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height="1rem" width="4rem" />
          <Skeleton height="2.5rem" className="rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
    {/* Header */}
    <div className="p-4 border-b border-white/10">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={i} height="1.25rem" width="60%" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 border-b border-white/10 last:border-b-0">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={colIndex} height="1rem" width={`${Math.random() * 40 + 40}%`} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Text Block Skeleton
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="space-y-2">
    {[...Array(lines)].map((_, i) => (
      <Skeleton 
        key={i} 
        height="1rem" 
        width={i === lines - 1 ? "60%" : "100%"} 
      />
    ))}
  </div>
);

// Dashboard Card Skeleton
export const DashboardCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="1rem" width="6rem" />
        <Skeleton height="2rem" width="4rem" />
      </div>
      <Skeleton height="3rem" width="3rem" rounded />
    </div>
    <Skeleton height="1rem" width="40%" />
  </div>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = "300px" }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
    <div className="flex justify-between items-center mb-4">
      <Skeleton height="1.5rem" width="8rem" />
      <Skeleton height="2rem" width="6rem" className="rounded-lg" />
    </div>
    <Skeleton height={height} className="rounded-lg" />
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = ({ showAvatar = false }) => (
  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
    {showAvatar && <Skeleton height="3rem" width="3rem" rounded />}
    <div className="flex-1 space-y-2">
      <Skeleton height="1.25rem" width="70%" />
      <Skeleton height="1rem" width="50%" />
    </div>
    <Skeleton height="2rem" width="5rem" className="rounded-lg" />
  </div>
);

// Navigation Skeleton
export const NavSkeleton = () => (
  <div className="flex items-center justify-between p-4">
    <Skeleton height="2rem" width="8rem" />
    <div className="flex items-center gap-4">
      <Skeleton height="2.5rem" width="6rem" className="rounded-lg" />
      <Skeleton height="2.5rem" width="2.5rem" rounded />
    </div>
  </div>
);

// Page Container Skeleton
export const PageSkeleton = ({ 
  showNav = true, 
  showSidebar = false,
  children 
}) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
    {showNav && <NavSkeleton />}
    
    <div className={`flex ${showSidebar ? 'gap-6' : ''} p-6`}>
      {showSidebar && (
        <div className="w-64 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="3rem" className="rounded-lg" />
          ))}
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  </div>
);

export default Skeleton;