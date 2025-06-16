import MainLayout from "@/components/Layout/MainLayout";

export default function Dashboard() {
  return (
    // sementara, while production
    // <Button
    //   onClick={handleLogout}
    //   variant="ghost"
    //   className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10"
    // >
    //   <LogOut className="w-4 h-4 mr-2" />
    //   Logout
    // </Button>
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang di dashboard FlightTracker Indonesia
        </p>
      </div>
    </MainLayout>
  );
}
