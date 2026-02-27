import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Badge } from "@/ui/badge";
import MainLayout from "@/components/Layout/MainLayout";

import { airportService } from "@/services/airportService";
import { flightService } from "@/services/flightService";
import type { Airport } from "@/types/airport";
import type { FlightStats, TrackingStatus } from "@/types/flight";

import { BarChart, Plane, Clock, Activity, TrendingUp } from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Visualization() {
  const [selectedAirport, setSelectedAirport] = useState<string>("all");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [visualizationData, setVisualizationData] = useState<FlightStats[]>([]);
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
    isTracking: false,
    activeBounds: "",
  });

  const loadData = async () => {
    try {
      const [airportRes, vizRes, statusRes] = await Promise.all([
        airportService.getAirports(),
        flightService.getVisualization(),
        flightService.getTrackingStatus(),
      ]);

      setAirports(airportRes.data);
      setVisualizationData(vizRes.data);
      setTrackingStatus(statusRes.data);
    } catch (error) {
      console.error("Gagal memuat data visualisasi", error);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredStats = useMemo(() => {
    if (selectedAirport === "all") {
      return visualizationData;
    }
    return visualizationData.filter((stat) => stat.code === selectedAirport);
  }, [visualizationData, selectedAirport]);

  const chartData = useMemo(() => {
    return visualizationData.map((stat) => ({
      airport: stat.code,
      flights: stat.total_data,
      airlines: stat.total_airlines,
    }));
  }, [visualizationData]);

  const totalFlights = visualizationData.reduce(
    (sum, item) => sum + item.total_data,
    0,
  );

  const currentActiveAirportCode = useMemo(() => {
    const active = airports.find(
      (a) => a.bounds === trackingStatus.activeBounds,
    );
    return active ? active.code : null;
  }, [airports, trackingStatus]);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Visualisasi Data
            </h1>
            <p className="text-slate-600 mt-1">
              Statistik dan visualisasi data penerbangan per bandara
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span className="text-sm text-slate-600">
              {totalFlights} total data
            </span>
          </div>
        </div>

        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Filter Bandara
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Bandara</label>
                <Select
                  value={selectedAirport}
                  onValueChange={setSelectedAirport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bandara" />
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
              {trackingStatus.isTracking && currentActiveAirportCode && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status Scraping</label>
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700">
                      Aktif: {currentActiveAirportCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Penerbangan per Bandara</CardTitle>
              <CardDescription>
                Jumlah data yang telah di-scraping dari setiap bandara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="airport" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      name === "flights" ? "Data Point" : "Maskapai",
                    ]}
                    labelFormatter={(label) => `Bandara: ${label}`}
                  />
                  <Bar dataKey="flights" fill="#3B82F6" name="flights" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribusi Data</CardTitle>
              <CardDescription>
                Persentase data dari setiap bandara
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.filter((d) => d.flights > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ airport, percent }) =>
                      `${airport} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="flights"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Data Point"]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Airport Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStats.map((stat) => {
            const isActive =
              trackingStatus.isTracking &&
              trackingStatus.activeBounds.includes(stat.code); // Logika sederhana
            return (
              <Card
                key={stat.code}
                className={isActive ? "ring-2 ring-green-500 bg-green-50" : ""}
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
                      {stat.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{stat.airport}</CardTitle>
                  <CardDescription>{stat.city}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Total Data</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stat.total_data}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Maskapai</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {stat.total_airlines}
                      </p>
                    </div>
                  </div>
                  {stat.last_update && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 pt-2 border-t border-slate-200">
                      <Clock className="w-3 h-3" />
                      Update:{" "}
                      {new Date(stat.last_update).toLocaleString("id-ID")}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Data</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalFlights}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Bandara Aktif</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {trackingStatus.isTracking ? 1 : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Bandara Terdaftar</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {airports.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status Sistem</p>
                  <p
                    className={`text-lg font-semibold ${trackingStatus.isTracking ? "text-green-600" : "text-slate-600"}`}
                  >
                    {trackingStatus.isTracking ? "Aktif" : "Standby"}
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
