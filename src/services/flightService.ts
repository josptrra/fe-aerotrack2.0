import api from "./api";

export const flightService = {
  getVisualization: async () => {
    const response = await api.get("/dashboard/visualization");
    return response.data;
  },
  getStats: async () => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },
  getTrackingStatus: async () => {
    const response = await api.get("/track/status");
    return response.data;
  },
  startTracking: async (bounds: string) => {
    const response = await api.post("/track/start", { bounds });
    return response.data;
  },

  stopTracking: async () => {
    const response = await api.post("/track/stop");
    return response.data;
  },
};
