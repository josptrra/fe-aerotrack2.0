import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Alert, AlertDescription } from "@/ui/alert";
import MainLayout from "@/components/Layout/MainLayout";
import AddAirportDialog from "@/components/AddAirportDialog";
import { airportService } from "@/services/airportService";
import { flightService } from "@/services/flightService";
import type { Airport } from "@/types/airport";
import type { DashboardSummary, TrackingStatus } from "@/types/flight";

import {
  MapPin,
  Plane,
  Play,
  Square,
  BarChart,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

export default function Dashboard() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    isTracking: false,
    activeBounds: "",
  });
  const [summary, setSummary] = useState<DashboardSummary>({
    total_airports: 0,
    total_flights: 0,
    total_data_points: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { toast } = useToast();

  // 1. Load Data Awal (Daftar Bandara & Summary)
  const loadInitialData = async () => {
    try {
      const airportRes = await airportService.getAirports();
      const summaryRes = await flightService.getStats();
      const statusRes = await flightService.getTrackingStatus();

      setAirports(airportRes.data);
      setSummary(summaryRes.data);
      setTrackingStatus(statusRes.data);
    } catch (error) {
      console.error("Gagal memuat data dashboard", error);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Polling setiap 10 detik untuk update angka statistik (Total Data)
    const interval = setInterval(async () => {
      try {
        const summaryRes = await flightService.getStats();
        const statusRes = await flightService.getTrackingStatus();
        setSummary(summaryRes.data);
        setTrackingStatus(statusRes.data);
        setLastUpdate(new Date().toLocaleTimeString("id-ID"));
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleStartScraping = async () => {
    if (!selectedAirport) return;

    try {
      // kirim bounds bandara yang dipilih ke backend
      await flightService.startTracking(selectedAirport.bounds);

      setTrackingStatus({
        isTracking: true,
        activeBounds: selectedAirport.bounds,
      });

      toast({
        title: "Scraping Dimulai",
        description: `Tracking real-time untuk ${selectedAirport.name} aktif.`,
      });
    } catch (error: unknown) {
      const message =
        isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : "Terjadi kesalahan";
      toast({
        title: "Gagal Memulai",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleStopScraping = async () => {
    try {
      await flightService.stopTracking();
      setTrackingStatus({
        isTracking: false,
        activeBounds: "",
      });

      toast({
        title: "Scraping Dihentikan",
        description: "Sistem kembali ke mode idle.",
      });
    } catch (error: unknown) {
      const message =
        isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : "Terjadi kesalahan";
      toast({
        title: "Gagal Menghentikan",
        description: message,
        variant: "destructive",
      });
    }
  };

  // helper buat cari bandara mana yang sedang aktif berdasarkan bounds
  const getActiveAirportName = () => {
    const active = airports.find(
      (a) => a.bounds === trackingStatus.activeBounds,
    );
    return active ? active.code : null;
  };

  const currentActiveAirportCode = getActiveAirportName();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Kontrol sistem scraping data penerbangan real-time
            </p>
          </div>
          <div className="flex items-center gap-4">
            {trackingStatus.isTracking && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Scraping Aktif</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-slate-600">
                {airports.length} Bandara
              </span>
            </div>
            <AddAirportDialog
              onAddAirport={() => {
                loadInitialData(); // Paksa Dashboard buat narik data terbaru dari API (biar ga blank)
              }}
            />
          </div>
        </div>

        {trackingStatus.isTracking && currentActiveAirportCode && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Scraping aktif untuk bandara{" "}
              <strong>{currentActiveAirportCode}</strong>.
              {lastUpdate && ` Update data terakhir: ${lastUpdate}`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airports.map((airport) => {
            const isActive = trackingStatus.activeBounds === airport.bounds;
            const isSelected = selectedAirport?.id === airport.id;

            return (
              <Card
                key={airport.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                } ${isActive ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                onClick={() =>
                  !trackingStatus.isTracking && setSelectedAirport(airport)
                }
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {airport.code}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{airport.name}</CardTitle>
                  <CardDescription>{airport.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600">
                      <p>Lat: {airport.lat.toFixed(4)}</p>
                      <p>Lng: {airport.lon.toFixed(4)}</p>
                      <p className="truncate">Bounds: {airport.bounds}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedAirport && !trackingStatus.isTracking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-emerald-600" />
                Kontrol Scraping - {selectedAirport.name}
              </CardTitle>
              <CardDescription>
                Mulai scraping berkelanjutan untuk bandara{" "}
                {selectedAirport.code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStartScraping}
                className="w-full h-12 bg-green-500 hover:black"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Mulai
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {trackingStatus.isTracking && currentActiveAirportCode && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Square className="w-5 h-5" />
                Scraping Aktif - {currentActiveAirportCode}
              </CardTitle>
              <CardDescription>
                Sistem sedang memantau area koordinat. Klik tombol di bawah
                untuk menghentikan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStopScraping}
                variant="destructive"
                className="w-full h-12"
              >
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4" />
                  Hentikan Scraping
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STATS SUMMARY BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="h-28 flex justify-center">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Bandara</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.total_airports}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-28 flex justify-center">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <BarChart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Baris Data</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.total_data_points}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-28 flex justify-center">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Plane className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status Scraping</p>
                  <p
                    className={`text-lg font-semibold ${
                      trackingStatus.isTracking
                        ? "text-green-600"
                        : "text-slate-600"
                    }`}
                  >
                    {trackingStatus.isTracking ? "Aktif" : "Tidak Aktif"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-28 flex justify-center">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Bandara Aktif</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {currentActiveAirportCode || "-"}
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
