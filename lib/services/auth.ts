import { API_CONFIG } from "../api";

export const authService = {
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/forgotten-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        redirectTo: `${window.location.origin}/reset-password` 
      }),
    });
    return response.json();
  },

  verifyOtp: async (email: string, token: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    return response.json();
  },

  resetPassword: async (password: string, tempToken: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tempToken}`
      },
      body: JSON.stringify({ password }),
    });
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }
};
