export async function fetchApi(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Auto logout if expired/deleted
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  return response.json();
}
