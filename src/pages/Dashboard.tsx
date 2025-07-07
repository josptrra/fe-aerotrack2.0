import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
// import { Input } from "@/ui/input";
// import { Label } from "@/ui/label";
import { Badge } from "@/ui/badge";
import { Alert, AlertDescription } from "@/ui/alert";
import MainLayout from "@/components/Layout/MainLayout";
import AddAirportDialog from "@/components/AddAirportDialog";
import {
  indonesianAirports as defaultAirports,
  FlightScrapingService,
  type Airport,
  type ScrapingStats,
} from "@/services/airportService";
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

export default function Dashboard() {
  const [airports, setAirports] = useState<Airport[]>(defaultAirports);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [currentActiveAirport, setCurrentActiveAirport] = useState<
    string | null
  >(null);
  const [scrapingStats, setScrapingStats] = useState<ScrapingStats[]>([]);
  // const [apiKey, setApiKey] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const { toast } = useToast();

  const scrapingService = FlightScrapingService.getInstance();

  useEffect(() => {
    // Setup callbacks
    scrapingService.setStatsCallback((stats) => {
      setScrapingStats((prev) => {
        const newStats = [...prev];
        const existingIndex = newStats.findIndex(
          (s) => s.airportCode === stats.airportCode
        );
        if (existingIndex >= 0) {
          newStats[existingIndex] = stats;
        } else {
          newStats.push(stats);
        }
        return newStats;
      });
    });

    scrapingService.setDataCallback(() => {
      setLastUpdate(new Date().toLocaleTimeString("id-ID"));
    });

    setScrapingStats(scrapingService.getScrapingStats());
    setCurrentActiveAirport(scrapingService.getCurrentActiveAirport());
    setIsScrapingActive(scrapingService.isCurrentlyScrapingForAirport());

    return () => {};
  }, []);

  const handleAddAirport = (newAirport: Airport) => {
    const existingAirport = airports.find(
      (airport) => airport.code === newAirport.code
    );
    if (existingAirport) {
      toast({
        title: "Error",
        description: `Bandara dengan kode ${newAirport.code} sudah ada`,
        variant: "destructive",
      });
      return;
    }

    setAirports((prev) => [...prev, newAirport]);
  };

  const handleStartScraping = async () => {
    if (!selectedAirport) return;

    try {
      // await scrapingService.startContinuousScraping(
      //   selectedAirport.code,
      //   apiKey || undefined
      // );
      // comment dulu sementara, karena api key belum ada
      await scrapingService.startContinuousScraping(selectedAirport.code);
      setIsScrapingActive(true);
      setCurrentActiveAirport(selectedAirport.code);

      toast({
        title: "Scraping Dimulai",
        description: `Scraping berkelanjutan untuk ${selectedAirport.name} telah dimulai`,
      });
    } catch (error) {
      toast({
        title: "Gagal Memulai Scraping",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleStopScraping = async () => {
    try {
      await scrapingService.stopScraping();
      setIsScrapingActive(false);
      setCurrentActiveAirport(null);

      toast({
        title: "Scraping Dihentikan",
        description: "Scraping data telah dihentikan",
      });
    } catch (error) {
      toast({
        title: "Gagal Menghentikan Scraping",
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const getAirportStats = (airportCode: string) => {
    return scrapingStats.find((s) => s.airportCode === airportCode);
  };

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
            {isScrapingActive && (
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
            <AddAirportDialog onAddAirport={handleAddAirport} />
          </div>
        </div>

        {/* API Key Configuration */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Konfigurasi API
            </CardTitle>
            <CardDescription>
              Masukkan API key Flightradar24 untuk data real-time (opsional -
              akan menggunakan simulasi jika kosong)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Flightradar24 API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Masukkan API key (opsional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isScrapingActive}
              />
            </div>
          </CardContent>
        </Card> */}

        {isScrapingActive && currentActiveAirport && (
          <Alert className="border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Scraping aktif untuk bandara{" "}
              <strong>{currentActiveAirport}</strong>.
              {lastUpdate && ` Update terakhir: ${lastUpdate}`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airports.map((airport) => {
            const stats = getAirportStats(airport.code);
            const isActive = currentActiveAirport === airport.code;
            const isSelected = selectedAirport?.id === airport.id;

            return (
              <Card
                key={airport.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                } ${isActive ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                onClick={() => !isScrapingActive && setSelectedAirport(airport)}
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
                      <p>Lat: {airport.latitude.toFixed(4)}</p>
                      <p>Lng: {airport.longitude.toFixed(4)}</p>
                      <p>Bounds: </p>
                    </div>
                    {stats && (
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">
                            Data Tersimpan:
                          </span>
                          <span className="font-medium text-slate-900">
                            {stats.totalFlights}
                          </span>
                        </div>
                        {stats.lastUpdate && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(stats.lastUpdate).toLocaleString("id-ID")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedAirport && !isScrapingActive && (
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
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Mulai Scraping Berkelanjutan
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {isScrapingActive && currentActiveAirport && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Square className="w-5 h-5" />
                Scraping Aktif - {currentActiveAirport}
              </CardTitle>
              <CardDescription>
                Scraping sedang berjalan setiap 30 detik. Klik tombol dibawah
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="h-28 flex justify-center">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Bandara</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {airports.length}
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
                  <p className="text-sm text-slate-600">Total Data</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {scrapingService.getFlightsFromStorage().length}
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
                      isScrapingActive ? "text-green-600" : "text-slate-600"
                    }`}
                  >
                    {isScrapingActive ? "Aktif" : "Tidak Aktif"}
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
                    {currentActiveAirport || "-"}
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
