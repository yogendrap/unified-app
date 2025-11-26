import React from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function ProtectedLayout({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
      <main className="flex-1 bg-gray-100 min-h-screen p-6">{children}</main>
      </div>
    </div>
  );
}
