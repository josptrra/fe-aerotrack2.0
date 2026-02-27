import api from "./api";

export interface ExportPayload {
  format: "excel" | "csv";
  airportCodes?: string[];
  minAlt?: number;
  maxAlt?: number;
  columns?: string[];
}

export const exportService = {
  downloadData: async (payload: ExportPayload) => {
    const response = await api.post("/export", payload, {
      responseType: "blob",
    });

    // Logic buat trigger download di browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const extension = payload.format === "excel" ? "xlsx" : "csv";
    link.setAttribute(
      "download",
      `Aerotrack_Export_${new Date().getTime()}.${extension}`,
    );

    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
