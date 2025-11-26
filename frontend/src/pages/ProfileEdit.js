import { useState, useEffect } from "react";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function ProfileEdit() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    //avatar: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API}/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error(error);
        setMessage("Error loading profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setMessage("✅ Profile updated successfully!");
      setFormData(data);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error updating profile.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

      {message && (
        <div className="text-center mb-4 text-sm text-gray-700">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        {/* <div>
          <label className="block text-sm font-medium">Avatar URL</label>
          <input
            name="avatar"
            type="text"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full border rounded-lg p-2 mt-1"
          />
          {formData.avatar && (
            <img
              src={formData.avatar}
              alt="Avatar Preview"
              className="h-20 w-20 mt-3 rounded-full mx-auto"
            />
          )}
        </div> */}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
