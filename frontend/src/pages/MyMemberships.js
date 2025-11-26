import React, { useEffect, useState } from "react";

export default function MyMemberships() {
  const [memberships, setMemberships] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/memberships/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setMemberships(data.memberships || []);
        else alert(data.message || "Failed");
      } catch (err) {
        alert("Network error: " + err.message);
      }
    }
    fetchMe();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-3">My Memberships</h2>
      {memberships.length === 0 && <div>You have no memberships</div>}
      <div className="space-y-3">
        {memberships.map((m) => (
          <div key={m._id} className="border p-3 rounded">
            <div><strong>{m.organizationId?.name}</strong></div>
            <div>Status: <span className={m.status==="approved"?"text-green-600":m.status==="rejected"?"text-red-600":"text-yellow-600"}>{m.status}</span></div>
            <div>Role: {m.role}</div>
            <div className="text-sm text-gray-500">Requested: {new Date(m.requestedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
