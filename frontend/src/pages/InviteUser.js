// src/pages/InviteUser.js
import React, { useEffect, useState } from "react";

export default function InviteUser() {
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);           // from backend
  const [inviteRole, setInviteRole] = useState(""); // selected role
  const [message, setMessage] = useState("");
  const [loadingRoles, setLoadingRoles] = useState(true);

  const token = localStorage.getItem("token");
  const organizationId = localStorage.getItem("activeOrg");

  // Fetch roles from backend
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/memberships/roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.roles) && data.roles.length) {
          setRoles(data.roles);
          setInviteRole(data.roles[0]); // default to first from backend
        } else {
          setRoles(["member"]);
          setInviteRole("member");
        }
      } catch (e) {
        console.error(e);
        setRoles(["member"]);
        setInviteRole("member");
      } finally {
        setLoadingRoles(false);
      }
    };
    loadRoles();
  }, [token]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setMessage("Sending invite...");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/invite/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, organizationId, inviteRole }), // <- role from backend
      });

      const data = await res.json();
      if (res.ok) setMessage(`✅ ${data.message}`);
      else setMessage(`❌ ${data.message}`);
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Invite User</h2>

      <form onSubmit={handleInvite} className="space-y-4 max-w-md">

  {/* Email Address */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Email Address</label>
    <input
      type="email"
      placeholder="Enter email to invite"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2"
      required
    />
  </div>

  {/* Team / Role */}
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">Team</label>
    <select
      disabled={loadingRoles}
      value={inviteRole}
      onChange={(e) => setInviteRole(e.target.value)}
      className="border border-gray-300 rounded px-3 py-2"
    >
      {roles.map((r) => (
        <option key={r} value={r}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>
  </div>

  {/* Submit Button */}
  <button
    type="submit"
    disabled={!organizationId || !inviteRole}
    className="bg-blue-600 text-white w-full py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
  >
    Send Invite
  </button>
</form>


      {loadingRoles && <p className="mt-3 text-gray-500 text-sm">Loading roles…</p>}
      {message && <p className="mt-3 text-gray-700">{message}</p>}
    </div>
  );
}
