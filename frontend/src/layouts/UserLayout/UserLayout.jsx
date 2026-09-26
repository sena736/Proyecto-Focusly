import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import useAuth from "../../hooks/useAuth";
import "./UserLayout.css";

const UserLayout = () => {
  const { isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="user-layout">
      <button
        type="button"
        className="user-layout__menu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="user-layout__backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="user-layout__content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
