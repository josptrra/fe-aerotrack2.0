import api from "./api";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await api.post("/login", payload);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
};
