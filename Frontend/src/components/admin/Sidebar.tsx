import React from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { label: "Products", icon: "shopping_bag", path: "/admin/products" },
    { label: "Categories", icon: "category", path: "/admin/categories" },
    { label: "Pin Parser", icon: "content_cut", path: "/admin/pin-parser" },
    { label: "Feedback", icon: "feedback", path: "/admin/feedback" },
    { label: "Settings", icon: "settings", path: "/admin/settings" },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-icons-outlined text-sm">inventory_2</span>
          </div>
          <span className="text-lg font-bold text-neutral-dark">
            AffiliatePro
          </span>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path + "/")); // Ensure it matches sub-routes but not partials appropriately
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:text-primary hover:bg-primary/5"
                }`}
                onClick={onClose}
              >
                <span className="material-icons-outlined mr-3 text-xl">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-gray-500 hover:text-primary transition-colors text-sm"
          >
            <span className="material-icons-outlined mr-3 text-xl">logout</span>
            Back to Site
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
