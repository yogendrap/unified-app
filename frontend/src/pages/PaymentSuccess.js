// src/pages/PaymentSuccess.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import paymentSuccess from "../assets/pass.jpg";
import paymentFail from "../assets/fail.png";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("loading");
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/payments/session/${sessionId}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setPaymentInfo(data);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error fetching payment session:", err);
        setStatus("error");
      }
    };

    fetchSession();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {status === "loading" && (
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </div>
      )}

      {status === "success" && (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md">
          <img
            src={paymentSuccess}
            alt="Success"
            className="w-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-green-600 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            Thank you for subscribing to the <strong>{paymentInfo.channel}</strong> channel.
          </p>
          <div className="text-sm bg-gray-50 border rounded p-3 text-left mb-4">
            <p><strong>Session ID:</strong> {paymentInfo.session_id}</p>
            <p><strong>Amount Paid:</strong> ${(paymentInfo.amount / 100).toFixed(2)}</p>
            <p><strong>Plan:</strong> {paymentInfo.plan}</p>
          </div>
          <a
            href="/channels"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go to Channels
          </a>
        </div>
      )}

      {status === "error" && (
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md">
          <img
            src={paymentFail}
            alt="Error"
            className="w-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Payment Verification Failed
          </h2>
          <p className="text-gray-600 mb-4">
            We couldn’t verify your payment. Please try again or contact support.
          </p>
          <a
            href="/channels"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Back to Subscription
          </a>
        </div>
      )}
    </div>
  );
}
