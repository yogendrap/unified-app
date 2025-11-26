import React from "react";

export default async function CheckOrgAdmin(userId, orgId, token) {
  const res = await fetch(
    `${process.env.REACT_APP_API_URL}/org-admin/check?userId=${userId}&orgId=${orgId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.json();
}