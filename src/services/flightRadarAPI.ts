import type { FlightData } from "@/types/airport";
import { FlightDataGenerator } from "@/utils/dummyFlightGenerator";
import { indonesianAirports } from "@/data/indonesianAirports";

interface Flightradar24Response {
  result?: {
    response?: {
      airport?: {
        pluginData?: {
          schedule?: {
            arrivals?: {
              data?: Flightradar24Flight[];
            };
            departures?: {
              data?: Flightradar24Flight[];
            };
          };
        };
      };
    };
  };
}

interface Flightradar24Flight {
  flight: {
    identification: {
      id: string;
      number?: {
        default?: string;
      };
    };
    airline?: {
      name?: string;
    };
    airport: {
      origin?: {
        code?: {
          iata?: string;
        };
      };
      destination?: {
        code?: {
          iata?: string;
        };
      };
    };
    aircraft?: {
      model?: {
        text?: string;
      };
    };
    status?: {
      live?: {
        altitude?: number;
        speed?: number;
      };
      text?: string;
    };
  };
}

export class FlightradarAPIService {
  static async fetchFlightData(
    airportCode: string,
    apiKey?: string
  ): Promise<FlightData[]> {
    const airport = indonesianAirports.find((a) => a.code === airportCode);
    if (!airport) throw new Error("Airport tidak ditemukan");

    if (apiKey) {
      try {
        return await this.fetchFromFlightradar24API(airportCode, apiKey);
      } catch (error) {
        console.warn(
          "Gagal mengakses API Flightradar24, menggunakan data simulasi",
          error instanceof Error ? error.message : "Unknown error"
        );
        return FlightDataGenerator.generateSampleFlights(airportCode);
      }
    } else {
      return FlightDataGenerator.generateSampleFlights(airportCode);
    }
  }

  private static async fetchFromFlightradar24API(
    airportCode: string,
    apiKey: string
  ): Promise<FlightData[]> {
    const response = await fetch(
      `https://api.flightradar24.com/common/v1/airport.json?code=${airportCode}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformAPIData(data, airportCode);
  }

  private static transformAPIData(
    apiData: Flightradar24Response,
    airportCode: string
  ): FlightData[] {
    const flights: FlightData[] = [];

    if (apiData.result?.response?.airport?.pluginData?.schedule) {
      const scheduleData = apiData.result.response.airport.pluginData.schedule;

      [
        ...(scheduleData.arrivals?.data || []),
        ...(scheduleData.departures?.data || []),
      ].forEach((flight: Flightradar24Flight) => {
        flights.push({
          id: `${flight.flight.identification.id}_${Date.now()}`,
          flightNumber: flight.flight.identification.number?.default || "N/A",
          airline: flight.flight.airline?.name || "Unknown",
          departure: flight.flight.airport.origin?.code?.iata || airportCode,
          destination: flight.flight.airport.destination?.code?.iata || "N/A",
          aircraft: flight.flight.aircraft?.model?.text || "Unknown",
          altitude: flight.flight.status?.live?.altitude || 0,
          speed: flight.flight.status?.live?.speed || 0,
          status: flight.flight.status?.text || "Unknown",
          timestamp: new Date().toISOString(),
          airportCode,
        });
      });
    }

    return flights.length > 0
      ? flights
      : FlightDataGenerator.generateSampleFlights(airportCode);
  }
}
