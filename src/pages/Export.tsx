import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Checkbox } from "@/ui/checkbox";
import MainLayout from "@/components/Layout/MainLayout";
import { airportService } from "@/services/airportService";
import { flightService } from "@/services/flightService";
import { exportService, type ExportPayload } from "@/services/exportService";
import type { Airport } from "@/types/airport";

import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Database,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

export default function Export() {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [selectedAirport, setSelectedAirport] = useState<string>("all");
  const [minAltitude, setMinAltitude] = useState<string>("");
  const [maxAltitude, setMaxAltitude] = useState<string>("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [totalDatabaseRows, setTotalDatabaseRows] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "flightId",
    "callsign",
    "lat",
    "lon",
    "alt",
    "gspeed",
    "vspeed",
    "timestamp",
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [airportRes, statsRes] = await Promise.all([
          airportService.getAirports(),
          flightService.getStats(),
        ]);
        setAirports(airportRes.data);
        setTotalDatabaseRows(statsRes.data.total_data_points);
      } catch (err) {
        console.error("Gagal load data export", err);
      }
    };
    loadInitialData();
  }, []);

  const availableColumns = [
    { key: "flightId", label: "Flight ID (FR24)" },
    { key: "callsign", label: "Callsign / Flight Number" },
    { key: "lat", label: "Latitude" },
    { key: "lon", label: "Longitude" },
    { key: "alt", label: "Altitude (ft)" },
    { key: "gspeed", label: "Ground Speed (kt)" },
    { key: "vspeed", label: "Vertical Speed" },
    { key: "timestamp", label: "Waktu Perekaman" },
  ];

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((col) => col !== columnKey)
        : [...prev, columnKey],
    );
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast({
        title: "Pilih Kolom",
        description: "Pilih minimal satu kolom untuk diekspor.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const payload: ExportPayload = {
        format: exportFormat,
        airportCodes: selectedAirport === "all" ? [] : [selectedAirport],
        minAlt: minAltitude ? parseInt(minAltitude) : 0,
        maxAlt: maxAltitude ? parseInt(maxAltitude) : 50000,
        columns: selectedColumns,
      };
      await exportService.downloadData(payload);
      toast({
        title: "Export Berhasil",
        description: `Data sedang diunduh dalam format ${exportFormat.toUpperCase()}`,
      });
    } catch (error: unknown) {
      console.error("Error during export:", error);
      const message =
        isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Terjadi kesalahan saat mengekspor data";
      toast({
        title: "Export Gagal",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setSelectedAirport("all");
    setMinAltitude("");
    setMaxAltitude("");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Export Data</h1>
            <p className="text-slate-600 mt-1">
              Ekspor data penerbangan ke format CSV atau Excel
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            <span className="text-sm text-slate-600">
              {totalDatabaseRows} data tersedia di database
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Pengaturan Export
              </CardTitle>
              <CardDescription>
                Konfigurasikan format dan data yang akan diekspor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Format Export</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={exportFormat === "csv" ? "default" : "outline"}
                    onClick={() => setExportFormat("csv")}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    variant={exportFormat === "excel" ? "default" : "outline"}
                    onClick={() => setExportFormat("excel")}
                    className="justify-start"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel (XLSX)
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Kolom yang Diekspor
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={column.key}
                        checked={selectedColumns.includes(column.key)}
                        onCheckedChange={() => handleColumnToggle(column.key)}
                      />
                      <Label
                        htmlFor={column.key}
                        className="text-sm font-normal"
                      >
                        {column.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedColumns(availableColumns.map((col) => col.key))
                    }
                  >
                    Pilih Semua
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedColumns([])}
                  >
                    Hapus Semua
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full h-12 bg-black text-white hover:bg-slate-800"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses File...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export {exportFormat.toUpperCase()}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Data Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                Filter Data
              </CardTitle>
              <CardDescription>Filter data sebelum ekspor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Pilih Bandara</Label>
                <Select
                  value={selectedAirport}
                  onValueChange={setSelectedAirport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Bandara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bandara</SelectItem>
                    {airports.map((airport) => (
                      <SelectItem key={airport.code} value={airport.code}>
                        {airport.code} - {airport.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAltitudeExport">Min Altitude (ft)</Label>
                  <Input
                    id="minAltitudeExport"
                    type="number"
                    placeholder="0"
                    value={minAltitude}
                    onChange={(e) => setMinAltitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAltitudeExport">Max Altitude (ft)</Label>
                  <Input
                    id="maxAltitudeExport"
                    type="number"
                    placeholder="50000"
                    value={maxAltitude}
                    onChange={(e) => setMaxAltitude(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Reset Filter
              </Button>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">
                  Ringkasan Konfigurasi
                </h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    Format: <strong>{exportFormat.toUpperCase()}</strong>
                  </p>
                  <p>
                    Kolom terpilih: <strong>{selectedColumns.length}</strong>
                  </p>
                  <p>
                    Filter Bandara:{" "}
                    <strong>
                      {selectedAirport === "all" ? "Semua" : selectedAirport}
                    </strong>
                  </p>
                  <p>
                    Rentang Altitude:{" "}
                    <strong>
                      {minAltitude || "0"} - {maxAltitude || "50000"} ft
                    </strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
