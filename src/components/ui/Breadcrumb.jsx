import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";

const Breadcrumb = ({ customBreadcrumbs = null, className = "" }) => {
  const location = useLocation();
  
  // Generate breadcrumbs from URL path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    const breadcrumbs = [
      { name: 'Home', path: '/', icon: FaHome }
    ];

    // Route name mappings
    const routeNames = {
      'shop': 'Shop',
      'cart': 'Shopping Cart',
      'checkout': 'Checkout', 
      'profile': 'My Profile',
      'admin': 'Admin Panel',
      'auth': 'Authentication',
      'order': 'Order Details',
      'dashboard': 'Dashboard'
    };

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Skip dynamic IDs (like order IDs)
      if (pathname.length > 15 || /^[a-zA-Z0-9]{20,}$/.test(pathname)) {
        if (pathnames[index - 1] === 'order') {
          breadcrumbs.push({
            name: `Order #${pathname.slice(-8)}`,
            path: currentPath
          });
        }
        return;
      }

      const name = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
      breadcrumbs.push({
        name,
        path: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs for home page only
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-400 mb-6 ${className}`}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const Icon = crumb.icon;
        
        return (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <FaChevronRight className="text-gray-600" size={12} />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-1 text-pink-400 font-medium">
                {Icon && <Icon size={14} />}
                {crumb.name}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="flex items-center gap-1 hover:text-pink-400 transition-colors"
              >
                {Icon && <Icon size={14} />}
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Structured Breadcrumb for specific pages
export const StructuredBreadcrumb = ({ items, className = "" }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-400 mb-6 ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const Icon = item.icon;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <FaChevronRight className="text-gray-600" size={12} />
            )}
            
            {isLast ? (
              <span className="flex items-center gap-1 text-pink-400 font-medium">
                {Icon && <Icon size={14} />}
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                className="flex items-center gap-1 hover:text-pink-400 transition-colors"
              >
                {Icon && <Icon size={14} />}
                {item.name}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;