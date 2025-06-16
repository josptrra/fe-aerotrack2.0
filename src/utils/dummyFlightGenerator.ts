import type { FlightData } from "@/types/airport";

export class FlightDataGenerator {
  private static readonly airlines = [
    "Garuda Indonesia",
    "Lion Air",
    "Citilink",
    "AirAsia",
    "Batik Air",
    "Sriwijaya Air",
  ];
  private static readonly aircrafts = [
    "Boeing 737",
    "Airbus A320",
    "Boeing 777",
    "Airbus A330",
    "ATR 72",
  ];
  private static readonly statuses = [
    "Scheduled",
    "Boarding",
    "Departed",
    "Arrived",
    "Delayed",
  ];
  private static readonly airlineCodes = ["GA", "JT", "QG", "QZ", "ID", "SJ"];
  private static readonly allAirportCodes = [
    "CGK",
    "DPS",
    "MLG",
    "UPG",
    "KNO",
    "BDO",
  ];

  static generateSampleFlights(airportCode: string): FlightData[] {
    const flights: FlightData[] = [];
    const flightCount = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < flightCount; i++) {
      flights.push({
        id: `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        flightNumber: `${this.getRandomAirlineCode()}-${
          Math.floor(Math.random() * 9000) + 1000
        }`,
        airline:
          this.airlines[Math.floor(Math.random() * this.airlines.length)],
        departure: airportCode,
        destination: this.getRandomDestination(airportCode),
        aircraft:
          this.aircrafts[Math.floor(Math.random() * this.aircrafts.length)],
        altitude: Math.floor(Math.random() * 40000) + 5000,
        speed: Math.floor(Math.random() * 500) + 200,
        status: this.statuses[Math.floor(Math.random() * this.statuses.length)],
        timestamp: new Date().toISOString(),
        airportCode,
      });
    }

    return flights;
  }

  private static getRandomAirlineCode(): string {
    return this.airlineCodes[
      Math.floor(Math.random() * this.airlineCodes.length)
    ];
  }

  private static getRandomDestination(departure: string): string {
    const filtered = this.allAirportCodes.filter((code) => code !== departure);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
}
