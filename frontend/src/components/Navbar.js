import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-blue-600">
          Unified App
        </a>

        {/* Menu Items */}
        <div className="flex items-center space-x-6">
          {!isLoggedIn ? (
            <>
              <a
                href="/register"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                📝 Register
              </a>
              <a
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                🔐 Login
              </a>
            </>
          ) : (
            <>
              <a
                href="/profile"
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                👤 Profile
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-1 rounded-lg font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
