import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { QrCode, BarChart3, Settings, Home, LogOut, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logOut } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/ui/logo";

interface SidebarProps {
  currentView: string;
}

export default function Sidebar({ currentView }: SidebarProps) {
  const { authProvider } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (authProvider === 'firebase') {
      const { error } = await logOut();
      if (error) {
        toast({
          title: "Logout Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        window.location.reload();
      }
    } else {
      window.location.href = "/api/logout";
    }
  };

  const navigation = [
    { name: "Overview", href: "/", icon: Home, current: currentView === "overview" },
    { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode, current: currentView === "qr-codes" },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, current: currentView === "analytics" },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, current: currentView === "settings" },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40">
      <div className="p-6 border-b">
        <Logo size="md" />
      </div>
      
      <nav className="p-6 space-y-2">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                item.current
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        {/* Premium Subscription Card */}
        <Link href="/subscription">
          <div className="gradient-primary p-4 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center mb-2">
              <Crown className="w-5 h-5 mr-2" />
              <h4 className="font-semibold">InvexQR Premium</h4>
            </div>
            <p className="text-sm opacity-90 mb-3">Accédez à toutes les fonctionnalités avancées</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full bg-white text-primary hover:bg-gray-100"
            >
              5$/mois
            </Button>
          </div>
        </Link>
        
        {/* Logout Button */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
