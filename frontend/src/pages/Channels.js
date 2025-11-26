// src/pages/Channels.js
import React, { useState } from "react";
import WhatsAppLogo from "../assets/whatsapp.jpeg";
import TelegramLogo from "../assets/telegram.png";

export default function Channels() {
  const [token, setToken] = useState("");
  const auth = localStorage.getItem("token");
  const orgId = localStorage.getItem("activeOrg");

  const connectWhatsApp = async () => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/channel/whatsapp/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth}` },
      body: JSON.stringify({ orgId }),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("whatsapp_jwt", data.token);
      window.location.href = "https://chat.niswey.net/niswire"; // store short-term
    } else {
      console.log(data.message);
        window.location.href = "/subscribe?channel=whatsapp";
    }
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">
      
      {/* WhatsApp Card */}
      <div 
        className="border rounded-lg p-6 text-center cursor-pointer hover:bg-green-50"
         onClick={connectWhatsApp}
      >
        <img src={ WhatsAppLogo} alt="WhatsApp" className="w-20 mx-auto mb-3"/>
        <h3 className="text-lg font-semibold">WhatsApp</h3>
        <p className="text-sm text-gray-600"><a href="https://chat.niswey.net/niswire/"><h3>Connect</h3></a></p>
      </div>

      {/* Telegram Card */}
      <div className="border rounded-lg p-6 text-center opacity-50">
        <img src={ TelegramLogo } alt="Telegram" className="w-20 mx-auto mb-3"/>
        <h3 className="text-lg font-semibold">Telegram</h3>
        <p className="text-sm text-gray-600">Coming Soon</p>
      </div>
    {token && <pre className="mt-4 break-all">{token}</pre>}
    </div>
  );
}
