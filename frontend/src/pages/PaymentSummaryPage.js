import React, { useEffect, useState } from "react";
import { fetchApi } from "../utils/fetchApi";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function PaymentSummaryPage() {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const organizationId = localStorage.getItem("activeOrg");
  const organizationName = localStorage.getItem("activeOrgName");

  useEffect(() => {
    const loadPaymentSummary = async () => {
      try {
        const res = await fetchApi(`${API}/payment/${organizationId}/summary`);
        setPayment(res);
      } catch (err) {
        console.error("Error loading payment summary:", err);
      }
      setLoading(false);
    };

    if (organizationId) {
      loadPaymentSummary();
    }
  }, [organizationId]);

  if (!organizationId) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold text-red-600">No Organization Selected</h2>
        <p className="text-gray-600 mt-2">Please select an organization first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 animate-pulse text-gray-500">
        Loading Payment Summary...
      </div>
    );
  }

  if (!payment?.exists) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Payment Summary</h1>
        <p className="text-gray-700">
          No payment has been recorded yet for <strong>{organizationName}</strong>.
        </p>
      </div>
    );
  }

  const p = payment.payment;
  console.log("Payment summary data:", p);
  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Payment Summary for {organizationName}</h1>

      <div className="space-y-4">

        <div>
          <span className="text-sm text-gray-500">Amount</span>
          <p className="text-xl font-semibold">
            {p.plan}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Channel</span>
          <p className="text-xl font-semibold">
            {p.channel}
          </p>
        </div>
        
        <div>
          <span className="text-sm text-gray-500">Status</span>
          <p
            className={`text-xl font-semibold ${
              p.status === "active" ? "text-green-600" : "text-red-600"
            }`}
          >
            {p.status}
          </p>
        </div>

        <div>
          <span className="text-sm text-gray-500">Payment Date</span>
          <p className="text-lg">
            {new Date(p.date).toLocaleDateString()}
          </p>
        </div>

        {p.metadata?.reference && (
          <div>
            <span className="text-sm text-gray-500">Reference / Invoice</span>
            <p className="text-md text-gray-800">
              {p.metadata.reference}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
