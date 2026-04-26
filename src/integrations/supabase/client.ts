const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const apiClient = {
  async register(email: string, password: string, display_name: string) {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, display_name }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async logBatches(batches: any[]) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/batch-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(batches),
    });
    return res.json();
  },
};