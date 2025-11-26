import React, { useState, useEffect } from "react";

export default function TopBar() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(
    localStorage.getItem("activeOrg") || ""
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    async function fetchOrgs() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/memberships/me/orgs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        console.log("fetched orgs" , data.organizations);
        if (res.ok) {
          setOrgs(data.organizations || []);
          if (!selectedOrg && data.organizations.length > 0) {
            // default to first org
            console.log("setting default org" , data.organizations);
            setSelectedOrg(data.organizations[0].id);
            localStorage.setItem("activeOrg", data.organizations[0].id);
            localStorage.setItem("activeOrgName", data.organizations[0].name);
          }
        } else {
          console.error("Failed to fetch orgs:", data.message);
        }
      } catch (err) {
        console.error("Error fetching orgs:", err);
      }
    }

    fetchOrgs();
  }, []);

  const handleOrgChange = (e) => {
    const orgId = e.target.value;
    const orgName = e.target.options[e.target.selectedIndex].dataset.name;
    setSelectedOrg(orgId);
    localStorage.setItem("activeOrg", orgId);
    console.log("Selected org changed to", orgName);
    localStorage.setItem("activeOrgName", orgName);
    window.location.reload(); 
  };

  return (
    <div className="flex justify-between items-center bg-white shadow p-3 border-b">
      <h1 className="text-xl font-semibold text-gray-800"></h1>

      {/* Organization Dropdown */}
      <div>
        {orgs.length > 0 ? (
          <select
            value={selectedOrg}
            onChange={handleOrgChange}
            className="border border-gray-300 rounded px-2 py-1 text-gray-700"
          >
            {orgs.map((org) => (
              <option key={org.id} value={org.id} data-name={org.name}>
                {org.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-gray-500 text-sm">No organizations</span>
        )}
      </div>
    </div>
  );
}
