import React, { useEffect, useState } from "react";

/**
 * Subscription Page
 * - Fetches active plans from backend for a given channel (e.g. WhatsApp)
 * - Displays available plans
 * - On selection → creates Stripe checkout session
 */

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const organizationId = localStorage.getItem("activeOrg");

  // Hardcoded for now – later you can make this dynamic for each channel
  const channel = "whatsapp";

  /**
   * Fetch subscription plans from backend
   */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/plans/${channel}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setPlans(data);
          setSelectedPlan(data[0]);
        } else {
          setMessage("Failed to load plans");
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setMessage("Something went wrong loading plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [token]);

  /**
   * Handle Subscribe Click
   */
  const handleSubscribe = async () => {
    if (!selectedPlan) return alert("Please select a plan first");

    setProcessing(true);
    setMessage("Creating Stripe session...");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/payments/create-subscription-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: selectedPlan.stripePriceId, // Must exist in DB
          channel,
          plan: selectedPlan.name,
          organizationId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        setMessage(data.message || "Unable to start subscription");
      }
    } catch (error) {
      console.error("Error starting subscription:", error);
      setMessage("Error creating subscription session");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          Subscribe to {channel.charAt(0).toUpperCase() + channel.slice(1)} Channel
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-gray-500 text-center">No active plans found.</p>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPlan?._id === plan._id
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                <p className="text-gray-600 text-sm">{plan.description || "Subscription plan"}</p>
                <p className="mt-2 text-xl font-semibold text-blue-700">
                  {plan.currency?.toUpperCase() === "INR" ? "₹" : "$"}
                  {plan.price}
                  <span className="text-gray-500 text-sm ml-1">/ {plan.durationDays >= 365 ? "year" : "month"}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}

        <button
          onClick={handleSubscribe}
          disabled={!selectedPlan || processing}
          className={`mt-6 w-full py-3 rounded-md font-semibold text-white ${
            processing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {processing ? "Processing..." : "Subscribe & Pay with Stripe"}
        </button>
      </div>
    </div>
  );
}
