import type { FlightData, ScrapingStats } from "@/types/airport";
import { indonesianAirports } from "@/data/indonesianAirports";

export class FlightStorageService {
  static saveFlights(flights: FlightData[]): void {
    const existingFlights = this.getAllFlights();
    const allFlights = [...existingFlights, ...flights];
    localStorage.setItem("flightData", JSON.stringify(allFlights));
  }

  static getAllFlights(): FlightData[] {
    const stored = localStorage.getItem("flightData");
    return stored ? JSON.parse(stored) : [];
  }

  static getFlightsByAirport(airportCode: string): FlightData[] {
    const allFlights = this.getAllFlights();
    return allFlights.filter((flight) => flight.airportCode === airportCode);
  }

  static getFlightsByAltitudeRange(
    minAltitude: number,
    maxAltitude: number
  ): FlightData[] {
    const allFlights = this.getAllFlights();
    return allFlights.filter(
      (flight) =>
        flight.altitude >= minAltitude && flight.altitude <= maxAltitude
    );
  }

  static getScrapingStats(): ScrapingStats[] {
    return indonesianAirports.map((airport) => {
      const flights = this.getFlightsByAirport(airport.code);
      return {
        airportCode: airport.code,
        totalFlights: flights.length,
        lastUpdate:
          flights.length > 0
            ? Math.max(
                ...flights.map((f) => new Date(f.timestamp).getTime())
              ).toString()
            : "",
        isActive: false,
      };
    });
  }

  static clearAllFlights(): void {
    localStorage.removeItem("flightData");
  }
}
