// Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
// import Header from '../components/Header/Header'; // Uncomment if needed

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = (isOpen) => {
    setSidebarOpen(isOpen);
  };

  return (
    <div className="flex h-screen">
     
        <>
          <div
            className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-20"
            }`}
          >
            <Sidebar onToggle={handleSidebarToggle} />
          </div>

          <div
            className={`w-full flex flex-col transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-20"
            }`}
          >
            {/* <Header /> */}
            <main className="flex-1 p-4">
              <Outlet />
            </main>
          </div>
        </>

      
        {/* <main className="w-full">
          <Outlet />
        </main> */}
    </div>
  );
};

export default Layout;
