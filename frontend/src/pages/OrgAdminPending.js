// src/pages/OrgAdminPending.js
import React, { useEffect, useState } from "react";

export default function OrgAdminPending({ orgId }) {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState({});
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/org-admin/pending/${orgId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setItems(data);
  };

  useEffect(() => { load(); }, [orgId]);

  const approve = async (id) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/org-admin/approve/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role: roles[id] || "member" }),
    });
    if (res.ok) load();
  };

  const reject = async (id) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/org-admin/reject/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pending Org Approvals</h2>
      {items.length === 0 && <div>No pending requests</div>}
      {items.map((m) => (
        <div key={m._id} className="border p-3 rounded mb-2 bg-white">
          <div><b>User:</b> {m.userId?.email}</div>
          <div className="mt-2 flex items-center gap-2">
            <select
              className="border px-2 py-1 rounded"
              value={roles[m._id] || "member"}
              onChange={(e)=>setRoles({...roles,[m._id]: e.target.value})}
            >
              <option value="member">member</option>
              <option value="sales">sales</option>
              <option value="managerial">managerial</option>
              <option value="admin">admin</option>
            </select>
            <button onClick={()=>approve(m._id)} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
            <button onClick={()=>reject(m._id)} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
