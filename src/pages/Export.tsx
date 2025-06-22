import { useState, useMemo } from "react";
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
import {
  FlightScrapingService,
  type FlightData,
  indonesianAirports,
} from "@/services/airportService";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Database,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Export() {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("csv");
  const [selectedAirport, setSelectedAirport] = useState<string>("all");
  const [minAltitude, setMinAltitude] = useState<string>("");
  const [maxAltitude, setMaxAltitude] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "flightNumber",
    "airline",
    "departure",
    "destination",
    "aircraft",
    "altitude",
    "speed",
    "status",
    "timestamp",
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const scrapingService = FlightScrapingService.getInstance();
  const allFlights = scrapingService.getFlightsFromStorage();

  const filteredFlights = useMemo(() => {
    let filtered = allFlights;

    // Filter by airport
    if (selectedAirport !== "all") {
      filtered = filtered.filter(
        (flight) => flight.airportCode === selectedAirport
      );
    }

    // Filter by altitude range
    if (minAltitude) {
      filtered = filtered.filter(
        (flight) => flight.altitude >= parseInt(minAltitude)
      );
    }
    if (maxAltitude) {
      filtered = filtered.filter(
        (flight) => flight.altitude <= parseInt(maxAltitude)
      );
    }

    return filtered;
  }, [allFlights, selectedAirport, minAltitude, maxAltitude]);

  const availableColumns = [
    { key: "flightNumber", label: "Flight Number" },
    { key: "airline", label: "Airline" },
    { key: "departure", label: "Departure" },
    { key: "destination", label: "Destination" },
    { key: "aircraft", label: "Aircraft" },
    { key: "altitude", label: "Altitude" },
    { key: "speed", label: "Speed" },
    { key: "status", label: "Status" },
    { key: "timestamp", label: "Timestamp" },
    { key: "airportCode", label: "Airport Code" },
  ];

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((col) => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const generateCSV = (flights: FlightData[]): string => {
    const headers = selectedColumns.map(
      (col) => availableColumns.find((ac) => ac.key === col)?.label || col
    );

    const csvContent = [
      headers.join(","),
      ...flights.map((flight) =>
        selectedColumns
          .map((col) => {
            const value = flight[col as keyof FlightData];
            // Escape commas and quotes in CSV
            return typeof value === "string" && value.includes(",")
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    return csvContent;
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (filteredFlights.length === 0) {
      toast({
        title: "Tidak Ada Data",
        description:
          "Tidak ada data untuk diekspor. Coba ubah filter atau lakukan scraping terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

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
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const airportSuffix =
        selectedAirport !== "all" ? `_${selectedAirport}` : "";
      const altitudeSuffix =
        minAltitude || maxAltitude
          ? `_alt${minAltitude || "0"}-${maxAltitude || "max"}`
          : "";

      if (exportFormat === "csv") {
        const csvContent = generateCSV(filteredFlights);
        const filename = `flight_data${airportSuffix}${altitudeSuffix}_${timestamp}.csv`;
        downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
      } else {
        // Untuk Excel, kita buat CSV dengan header yang lebih formatted
        const csvContent = generateCSV(filteredFlights);
        const filename = `flight_data${airportSuffix}${altitudeSuffix}_${timestamp}.csv`;
        downloadFile(
          csvContent,
          filename,
          "application/vnd.ms-excel;charset=utf-8;"
        );
      }

      toast({
        title: "Export Berhasil",
        description: `${
          filteredFlights.length
        } data penerbangan berhasil diekspor dalam format ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Error during export:", error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat mengekspor data",
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
              {filteredFlights.length} data siap ekspor
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
              {/* Export Format */}
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
                    Excel
                  </Button>
                </div>
              </div>

              {/* Column Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Kolom yang Diekspor
                </Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
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

              {/* Export Button */}
              <Button
                onClick={handleExport}
                disabled={isExporting || filteredFlights.length === 0}
                className="w-full h-12 bg-black text-white"
              >
                {isExporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengekspor...
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
              {/* Airport Filter */}
              <div className="space-y-2">
                <Label>Bandara</Label>
                <Select
                  value={selectedAirport}
                  onValueChange={setSelectedAirport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bandara" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Bandara</SelectItem>
                    {indonesianAirports.map((airport) => (
                      <SelectItem key={airport.code} value={airport.code}>
                        {airport.code} - {airport.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Altitude Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minAltitudeExport">Min Altitude (ft)</Label>
                  <Input
                    id="minAltitudeExport"
                    type="number"
                    placeholder="e.g. 5000"
                    value={minAltitude}
                    onChange={(e) => setMinAltitude(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAltitudeExport">Max Altitude (ft)</Label>
                  <Input
                    id="maxAltitudeExport"
                    type="number"
                    placeholder="e.g. 40000"
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

              {/* Preview Data Count */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">
                  Preview Export
                </h4>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>
                    Total data: <strong>{filteredFlights.length}</strong>
                  </p>
                  <p>
                    Kolom: <strong>{selectedColumns.length}</strong>
                  </p>
                  <p>
                    Format: <strong>{exportFormat.toUpperCase()}</strong>
                  </p>
                  {selectedAirport !== "all" && (
                    <p>
                      Bandara: <strong>{selectedAirport}</strong>
                    </p>
                  )}
                  {(minAltitude || maxAltitude) && (
                    <p>
                      Altitude:{" "}
                      <strong>
                        {minAltitude || "0"} - {maxAltitude || "∞"} ft
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Exports Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Export</CardTitle>
            <CardDescription>
              Tips dan informasi tentang fitur export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Format CSV</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Kompatibel dengan Excel, Google Sheets</li>
                  <li>• Ukuran file lebih kecil</li>
                  <li>• Mudah dibaca oleh aplikasi lain</li>
                  <li>• Encoding UTF-8 untuk karakter Indonesia</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">
                  Filter Altitude
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Filter berdasarkan rentang ketinggian</li>
                  <li>• Berguna untuk analisis rute komersial vs privat</li>
                  <li>• Kosongkan untuk semua altitude</li>
                  <li>• Satuan dalam feet (ft)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
