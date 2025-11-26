import React, { useState } from "react";

export default function WhatsAppConnect() {
  const [token, setToken] = useState(null);
  const jwt = localStorage.getItem("token");

  const generateToken = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/channel/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ channel: "whatsapp" }),
    });

    const data = await res.json();
    setToken(data.token);
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h2 className="text-xl font-semibold mb-4">Connect WhatsApp</h2>

      <button
        onClick={generateToken}
        className="bg-green-600 px-4 py-2 rounded text-white"
      >
        Generate Channel Token
      </button>

      {token && (
        <p className="mt-4 p-3 bg-gray-100 rounded text-sm break-all">
          <b>Your WhatsApp Token:</b><br />{token}
        </p>
      )}
    </div>
  );
}
