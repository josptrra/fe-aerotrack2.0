import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Plane, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (username === "admin" && password === "password") {
        localStorage.setItem("isAuthenticated", "true");
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di FlightTracker Indonesia",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah ❌",
          variant: "default",
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-emerald-900 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto p-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full w-16 h-16 flex items-center justify-center">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Flight Tracker Indonesia</CardTitle>
          <CardDescription>
            Sistem Monitoring Penerbangan Real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-medium ">
                Username
              </Label>
              <Input
                type="text"
                placeholder="Masukkan username anda!"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 py-6"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium ">
                Password
              </Label>
              <div className="relative flex items-center justify-center">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password anda!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 py-6"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="absolute right-0 top-1.5 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-full animate-bounce">Memuat...</div>
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
