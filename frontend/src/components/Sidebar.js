// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { Home, Users, ImageMinus, Camera, ChevronLeft, ChevronRight, ChevronRightCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CheckOrgAdmin from "../utils/CheckOrgAdmin";

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);

useEffect(() => {
  const verifyRole = async () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const orgId = localStorage.getItem("activeOrg");

    if (!token || !storedUser || !orgId) return;

    const user = JSON.parse(storedUser);
    const data = await CheckOrgAdmin(user.id, orgId, token);

    setIsOrgAdmin(data.isAdmin); // ✅ true / false
  };

  verifyRole();
}, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const toggleMenu = (name) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleSidebar = () => setCollapsed(!collapsed);

  const activeOrg = localStorage.getItem("activeOrg") || "";
//   const isOrgAdmin = CheckOrgAdmin();
  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} />, route: "/" ,
      children: [
        { name: "Channels", route: "/channels" }]},
    { name: "Profile", icon: <Users size={20} />, route: "/profile" },
    // { name: "Subscrition", icon: <Users size={20} />, route: "/subscribe" },
    {
      name: "Organisation",
      icon: <Users size={20} />,
      children: [
        { name: "Overview", route: "/org" },
        { name: "Invite User", route: "/invite" }
      ]
    },
    { name: "My Memberships", icon: <Camera size={20} />, route: "/memberships" },

    // Hide this always
    { name: "Accept Invite", icon: <Users size={20} />, route: "/invite/accept", className: "hidden" },
  ];

 if (isOrgAdmin) {
  const orgMenu = menuItems.find((i) => i.name === "Organisation");
  if (orgMenu) {
    orgMenu.children = orgMenu.children || [];
    // avoid duplicates
    const exists = orgMenu.children.some((c) => c.route === `/admin/org/${activeOrg}`);
    if (!exists && activeOrg) {
      orgMenu.children.push({
        name: "Org Admin Pending",
        route: `/admin/org/${activeOrg}`,
      });
    }
    orgMenu.children.push({ name: "Payment summary", route: "/payment-summary" });

    orgMenu.children.push({
        name: "Manage Members",
        route: `/org/members`,
      });
  }
}


  if (user?.isGlobalAdmin) {
    menuItems.push({
      name: "Super Admin",
      icon: <Users size={20} />,
      children: [
        { name: "Pending Approvals", route: "/admin/super" }
      ]
    });
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex">
      <motion.div
        animate={{ width: collapsed ? "4rem" : "14rem" }}
        className="h-screen bg-gray-900 text-white flex flex-col justify-between shadow-xl"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {!collapsed && <span className="text-lg font-semibold">Unified App</span>}
            <button onClick={toggleSidebar} className="p-1 hover:bg-gray-700 rounded">
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Menu */}
          <nav className="mt-4">
            {menuItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <div
                      className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer"
                      onClick={() => toggleMenu(item.name)}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        {!collapsed && <span>{item.name}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronRightCircle
                          size={18}
                          className={`transition-transform ${openMenus[item.name] ? "rotate-90" : ""}`}
                        />
                      )}
                    </div>

                    {openMenus[item.name] && !collapsed && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <div
                            key={child.route}
                            onClick={() => navigate(child.route)}
                            className="p-2 text-sm hover:bg-gray-700 cursor-pointer rounded"
                          >
                            {child.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    onClick={() => navigate(item.route)}
                    className={`flex items-center p-3 hover:bg-gray-800 cursor-pointer ${item.className || ""}`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {!collapsed && (
                      <span className={`text-sm transition-all ${item.className || ""}`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-400 flex justify-between items-center">
          {!collapsed && <span>© 2025</span>}
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-500 text-sm"
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
}
