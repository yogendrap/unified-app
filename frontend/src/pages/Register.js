import React, { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Registering...");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(` ${data.message}`);
      } else {
        setMessage(` ${data.message}`);
      }
    } catch (error) {
      setMessage("Server error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🔐 Register
        </h2>
    

      <form onSubmit={handleSubmit} className="w-80 bg-white rounded-xl p-6 centered-shadow mx-auto">
         <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
        <input
          type="text"
          name="name"
          placeholder="Enter your Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border w-full p-2 mb-4 rounded w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
        <input
          type="email"
          name="email"
          placeholder="Enter your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="border w-full p-2 mb-4 rounded w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
        <input
          type="password"
          name="password"
          placeholder="Emter your Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border w-full p-2 mb-4 rounded w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
        >
          Register
        </button>
         <p className="text-sm text-center text-gray-600 mt-4">
          Do you have a account?{" "}
          <a
            href="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </form>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
    </div>
  );
}
