import api from "./api";
import type { Airport } from "@/types/airport";

export const airportService = {
  getAirports: async () => {
    const response = await api.get("/airports");
    return response.data;
  },

  createAirport: async (payload: Airport) => {
    const response = await api.post("/airports", payload);
    return response.data;
  },

  deleteAirport: async (id: number | string) => {
    const response = await api.delete(`/airports/${id}`);
    return response.data;
  },

  getAirportById: async (id: number | string) => {
    const response = await api.get(`/airports/${id}`);
    return response.data;
  },
};
