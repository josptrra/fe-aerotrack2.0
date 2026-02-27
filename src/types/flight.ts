export interface FlightStats {
  airport: string;
  code: string;
  city: string;
  total_data: number;
  total_airlines: number;
  last_update: string;
}

export interface DashboardSummary {
  total_airports: number;
  total_flights: number;
  total_data_points: number;
}

export interface TrackingStatus {
  isTracking: boolean;
  activeBounds: string;
}

export interface FlightDataPoint {
  id: number;
  flightId: string;
  lat: number;
  lon: number;
  track: number;
  alt: number;
  gspeed: number;
  vspeed: number;
  timestamp: string;
}
