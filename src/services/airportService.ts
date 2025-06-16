import type { FlightData, ScrapingStats } from "@/types/airport";
import { FlightradarAPIService } from "./flightRadarAPI";
import { FlightStorageService } from "./flightStorage";

export class FlightScrapingService {
  private static instance: FlightScrapingService;
  private scrapingInterval?: NodeJS.Timeout;
  private currentActiveAirport: string | null = null;
  private isScrapingActive = false;
  private onDataUpdate?: (data: FlightData[]) => void;
  private onStatsUpdate?: (stats: ScrapingStats) => void;

  static getInstance(): FlightScrapingService {
    if (!FlightScrapingService.instance) {
      FlightScrapingService.instance = new FlightScrapingService();
    }
    return FlightScrapingService.instance;
  }

  setDataCallback(callback: (data: FlightData[]) => void) {
    this.onDataUpdate = callback;
  }

  setStatsCallback(callback: (stats: ScrapingStats) => void) {
    this.onStatsUpdate = callback;
  }

  async startContinuousScraping(
    airportCode: string,
    apiKey?: string
  ): Promise<void> {
    if (this.isScrapingActive && this.currentActiveAirport !== airportCode) {
      throw new Error(
        `Scraping sedang aktif untuk bandara ${this.currentActiveAirport}. Hentikan terlebih dahulu.`
      );
    }

    if (this.isScrapingActive && this.currentActiveAirport === airportCode) {
      throw new Error(`Scraping untuk bandara ${airportCode} sudah berjalan.`);
    }

    this.isScrapingActive = true;
    this.currentActiveAirport = airportCode;

    console.log(`Memulai scraping berkelanjutan untuk bandara ${airportCode}`);

    await this.performScraping(airportCode, apiKey);

    this.scrapingInterval = setInterval(async () => {
      if (this.isScrapingActive) {
        await this.performScraping(airportCode, apiKey);
      }
    }, 30000);

    this.updateStats(airportCode);
  }

  async stopScraping(): Promise<void> {
    if (!this.isScrapingActive) {
      throw new Error("Tidak ada scraping yang sedang berjalan");
    }

    if (this.scrapingInterval) {
      clearInterval(this.scrapingInterval);
      this.scrapingInterval = undefined;
    }

    console.log(
      `Menghentikan scraping untuk bandara ${this.currentActiveAirport}`
    );

    this.isScrapingActive = false;
    const previousAirport = this.currentActiveAirport;
    this.currentActiveAirport = null;

    if (previousAirport) {
      this.updateStats(previousAirport);
    }
  }

  private async performScraping(
    airportCode: string,
    apiKey?: string
  ): Promise<void> {
    try {
      console.log(
        `Mengambil data untuk ${airportCode} pada ${new Date().toLocaleTimeString()}`
      );

      const flights = await FlightradarAPIService.fetchFlightData(
        airportCode,
        apiKey
      );
      FlightStorageService.saveFlights(flights);

      this.onDataUpdate?.(flights);
      this.updateStats(airportCode);
    } catch (error) {
      console.error("Error dalam scraping:", error);
    }
  }

  private updateStats(airportCode: string) {
    const flights = FlightStorageService.getFlightsByAirport(airportCode);
    const stats: ScrapingStats = {
      airportCode,
      totalFlights: flights.length,
      lastUpdate: new Date().toISOString(),
      isActive:
        this.isScrapingActive && this.currentActiveAirport === airportCode,
    };

    this.onStatsUpdate?.(stats);
  }

  getFlightsFromStorage(): FlightData[] {
    return FlightStorageService.getAllFlights();
  }

  getFlightsByAirport(airportCode: string): FlightData[] {
    return FlightStorageService.getFlightsByAirport(airportCode);
  }

  getFlightsByAltitudeRange(
    minAltitude: number,
    maxAltitude: number
  ): FlightData[] {
    return FlightStorageService.getFlightsByAltitudeRange(
      minAltitude,
      maxAltitude
    );
  }

  getScrapingStats(): ScrapingStats[] {
    return FlightStorageService.getScrapingStats();
  }

  getCurrentActiveAirport(): string | null {
    return this.currentActiveAirport;
  }

  isCurrentlyScrapingForAirport(airportCode?: string): boolean {
    if (airportCode) {
      return this.isScrapingActive && this.currentActiveAirport === airportCode;
    }
    return this.isScrapingActive;
  }

  clearAllFlights() {
    FlightStorageService.clearAllFlights();
  }
}

// Re-export untuk backward compatibility
export { indonesianAirports } from "@/data/indonesianAirports";
export type { Airport, FlightData, ScrapingStats } from "@/types/airport";
