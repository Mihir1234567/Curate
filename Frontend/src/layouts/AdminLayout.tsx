import React, { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { isAuthenticated, removeToken } from "../lib/auth";
import { api } from "../lib/api";

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    api.logoutAdmin();
    removeToken();
    navigate("/admin/login");
  };

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen bg-background-light overflow-hidden font-sans">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button
            className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Toggle sidebar"
          >
            <span className="material-icons-outlined">menu</span>
          </button>

          <div className="flex-1 flex justify-end items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Admin User
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <span className="material-icons-outlined text-gray-400 p-1">
                  person
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <span className="material-icons-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
