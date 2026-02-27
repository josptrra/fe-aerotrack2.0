import React, { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Airport } from "@/types/airport";
import { isAxiosError } from "axios";
import { airportService } from "@/services/airportService";

interface AddAirportDialogProps {
  onAddAirport: () => void;
}

const AddAirportDialog = ({ onAddAirport }: AddAirportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Tambah loading state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    latitude: "",
    longitude: "",
    bounds: "", // Tambahkan bounds
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    // Buat jadi async
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (
      !formData.name ||
      !formData.code ||
      !formData.city ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.bounds // Validasi bounds
    ) {
      toast({
        title: "Error",
        description: "Semua field harus diisi termasuk Bounds",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    try {
      const newAirportData: Airport = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        city: formData.city,
        lat: lat,
        lon: lng,
        bounds: formData.bounds,
      };

      await airportService.createAirport(newAirportData);

      onAddAirport();

      setFormData({
        name: "",
        code: "",
        city: "",
        latitude: "",
        longitude: "",
        bounds: "",
      });
      setOpen(false);

      toast({
        title: "Berhasil",
        description: `Bandara ${newAirportData.name} telah tersimpan di database`,
      });
    } catch (error: unknown) {
      const message =
        isAxiosError(error) && error.response?.data?.error
          ? String(error.response.data.error)
          : "Terjadi kesalahan server";
      toast({
        title: "Gagal Simpan",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Bandara
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Bandara Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi bandara yang ingin ditambahkan ke dalam sistem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Bandara</Label>
            <Input
              id="name"
              placeholder="contoh: Soekarno-Hatta International Airport"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode (3 huruf)</Label>
              <Input
                id="code"
                placeholder="CGK"
                maxLength={3}
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Kota</Label>
              <Input
                id="city"
                placeholder="Jakarta"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bounds">Bounds (N, S, W, E)</Label>
            <Input
              id="bounds"
              placeholder="0.66, 0.26, 101.24, 101.64"
              value={formData.bounds}
              onChange={(e) => handleInputChange("bounds", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude Tengah</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude Tengah</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Tambah Bandara"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAirportDialog;
