import React, { useEffect, useState } from "react";

export default function AdminPending() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPending() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/memberships/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("this is fecth" , res);
        const data = await res.json();
        if (res.ok) setPending(data.pending || []);
        else alert(data.message || "Failed to fetch");
      } catch (err) {
        alert("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPending();
  }, [token]);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure to ${action} this membership?`)) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/memberships/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPending((p) => p.filter((m) => m._id !== id));
        alert(data.message);
      } else {
        alert(data.message || "Error");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pending Memberships</h2>
      {pending.length === 0 && <div>No pending requests</div>}
      <div className="space-y-3">
        {pending.map((m) => (
          <div key={m._id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <div><strong>{m.userId?.name}</strong> — {m.userId?.email}</div>
              <div className="text-sm text-gray-600">
                Org: {m.organizationId?.name}
              </div>
              <div className="text-sm text-gray-500">Requested: {new Date(m.requestedAt).toLocaleString()}</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(m._id, "approve")}
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(m._id, "reject")}
                className="px-3 py-1 bg-red-500 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
