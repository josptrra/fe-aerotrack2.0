export interface Airport {
  id: string;
  name: string;
  code: string;
  city: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface FlightData {
  id: string;
  flightNumber: string;
  airline: string;
  departure: string;
  destination: string;
  aircraft: string;
  altitude: number;
  speed: number;
  status: string;
  timestamp: string;
  airportCode: string;
}

export interface ScrapingStats {
  airportCode: string;
  totalFlights: number;
  lastUpdate: string;
  isActive: boolean;
}
