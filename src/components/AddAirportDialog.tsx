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

interface AddAirportDialogProps {
  onAddAirport: (airport: Airport) => void;
}

const AddAirportDialog = ({ onAddAirport }: AddAirportDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.code ||
      !formData.city ||
      !formData.latitude ||
      !formData.longitude
    ) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (formData.code.length !== 3) {
      toast({
        title: "Error",
        description: "Kode bandara harus 3 karakter",
        variant: "destructive",
      });
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Error",
        description: "Latitude dan longitude harus berupa angka",
        variant: "destructive",
      });
      return;
    }

    const newAirport: Airport = {
      id: Date.now().toString(),
      name: formData.name,
      code: formData.code.toUpperCase(),
      city: formData.city,
      latitude: lat,
      longitude: lng,
      country: "Indonesia",
    };

    onAddAirport(newAirport);

    // Reset form
    setFormData({
      name: "",
      code: "",
      city: "",
      latitude: "",
      longitude: "",
    });

    setOpen(false);

    toast({
      title: "Berhasil",
      description: `Bandara ${newAirport.name} telah ditambahkan`,
    });
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
          <div className="space-y-2">
            <Label htmlFor="code">Kode Bandara (3 huruf)</Label>
            <Input
              id="code"
              placeholder="contoh: CGK"
              maxLength={3}
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              placeholder="contoh: Jakarta"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </div>
          {/* Bounds for goods. */}
          <div className="space-y-2">
            <Label htmlFor="Bounds">Bounds</Label>
            <Input id="Bounds" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="contoh: -6.1256"
                value={formData.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="contoh: 106.6558"
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
            <Button type="submit">Tambah Bandara</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAirportDialog;
