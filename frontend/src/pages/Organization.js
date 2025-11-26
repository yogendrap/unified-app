import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";

export default function Organization() {
  const [orgs, setOrgs] = useState([]);
  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("activeOrg");
  useEffect(() => {
    async function fetchOrgs() {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orgs/my?orgId=${orgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("fetching orgs with token", res);
      console.log("fetching orgs from", orgId);
      
      const data = await res.json();
      console.log("response", data);
      setOrgs(data);
    }
    fetchOrgs();
    
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your Organizations</h1>
        {orgs.length === 0 ? (
        <p className="text-gray-500">You are not part of any organization.</p>
      ) : (
        <ul className="space-y-2">
          {orgs.map(org => (
            <li key={org.id} className="p-3 border rounded bg-white shadow">
              <strong>{org.name}</strong> 
              <div className="text-sm text-gray-500">{org.createdAt}</div>
            </li>
          ))} 
        </ul>
      )}
    </div>
  );
}
