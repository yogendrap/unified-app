import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user || {}))
      .catch(() => setUser({}));
  }, []);

  const handleLogout = () => {
    //localStorage.removeItem("token");
    //localStorage.removeItem("activeOrg");
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome,{" "}
          <span className="text-blue-600">
            {user?.name || user?.email || "User"}
          </span>{" "}
          🎉
        </h1>

        <p className="text-gray-600 mb-8">
          You’re now logged in to your dashboard.
        </p>

        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left shadow-sm">
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-800 font-medium">{user?.email || "—"}</p>
          </div>

          {user?.createdAt && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left shadow-sm">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-gray-800 font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
