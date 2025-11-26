import React, { useEffect, useState } from "react";
import { fetchApi } from "../utils/fetchApi";
import CheckOrgAdmin from "../utils/CheckOrgAdmin";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function OrgMembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);

  const organizationId = localStorage.getItem("activeOrg");
  const organizationName = localStorage.getItem("activeOrgName");
  const userId = JSON.parse(localStorage.getItem("user"));
  const userRole = localStorage.getItem("userRole"); // IMPORTANT
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
 
console.log("User Role:", userId.id);
  if (!organizationId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-red-600">No Organization Selected</h2>
        <p className="mt-2 text-gray-600">Please select an organization first.</p>
      </div>
    );
  }

  const loadMembers = async () => {
    try {
      const url = `${API}/memberships/${organizationId}/members`;
      const res = await fetchApi(url);
      if (res && res.members) setMembers(res.members);
    } catch (err) {
      console.error("Error loading org members:", err);
    }
    setLoading(false);
  };

  const kickUser = async (memberId) => {
    const confirmKick = window.confirm("Are you sure you want to remove this user?");
    if (!confirmKick) return;

    try {
      await fetchApi(`${API}/memberships/${organizationId}/kick/${memberId}`, {
        method: "POST"
      });

      alert("Member removed successfully");
      loadMembers();
    } catch (err) {
      console.error("Kick error:", err);
      alert("Unable to remove member");
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Members of {organizationName}
      </h1>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-600">No members found.</p>
      ) : (
        <ul className="space-y-4">
          {members.map((m) => (
            <li
              key={m._id}
              className="flex justify-between items-center bg-white shadow-md p-4 rounded-lg border border-gray-200"
            >
              <div>
                <p className="text-lg font-medium text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-600">{m.email}</p>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    m.role === "admin"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {m.role}
                </span>
              </div>

              {/* ADMIN CAN KICK — except themselves */}
              { m._id !== userId.id && (
                <button
                  onClick={() => kickUser(m._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                >
                  leave
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
