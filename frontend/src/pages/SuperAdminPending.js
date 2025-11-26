import React, { useEffect, useState } from "react";

export default function SuperAdminPending() {
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");

  const load = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/super-admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setItems(data);
  };

  useEffect(() => { load(); }, []);

  const act = async (id, action) => {
    const url = `${process.env.REACT_APP_API_URL}/super-admin/${action}/${id}`;
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) load();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pending Org Admin Approvals</h2>
      {items.length === 0 && <div>No pending requests</div>}
      {items.map((m) => (
        <div key={m._id} className="border p-3 rounded mb-2 bg-white">
          <div><b>User:</b> {m.userId?.email} | <b>Org:</b> {m.organizationId?.name}</div>
          <div className="mt-2 flex gap-2">
            <button onClick={()=>act(m._id,"approve")} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
            <button onClick={()=>act(m._id,"reject")} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
