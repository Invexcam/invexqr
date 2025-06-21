import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/sidebar";
import Overview from "@/components/dashboard/overview";
import QRCodes from "@/components/dashboard/qr-codes";
import Analytics from "@/components/dashboard/analytics";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Plus, Crown } from "lucide-react";
import EnhancedCreateQRModal from "@/components/dashboard/enhanced-create-qr-modal";
import { useState } from "react";

export default function Dashboard() {
  const { view = "overview" } = useParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getPageTitle = (view: string) => {
    switch (view) {
      case "qr-codes": return { title: "QR Codes", subtitle: "Manage all your QR codes in one place" };
      case "analytics": return { title: "Analytics", subtitle: "Detailed insights into your QR code performance" };
      case "settings": return { title: "Settings", subtitle: "Manage your account and preferences" };
      default: return { title: "Overview", subtitle: "Welcome back! Here's what's happening with your QR codes." };
    }
  };

  const { title, subtitle } = getPageTitle(view);

  const renderContent = () => {
    switch (view) {
      case "qr-codes":
        return (
          <PremiumFeatureGate 
            feature="Gestion QR Codes"
            description="La gestion avancée des QR codes est disponible avec l'abonnement premium."
          >
            <QRCodes onCreateClick={() => setShowCreateModal(true)} />
          </PremiumFeatureGate>
        );
      case "analytics":
        return (
          <PremiumFeatureGate 
            feature="Analytics Avancés"
            description="Les analyses détaillées et statistiques sont réservées aux abonnés premium."
          >
            <Analytics />
          </PremiumFeatureGate>
        );
      case "settings":
        return (
          <PremiumFeatureGate 
            feature="Paramètres Avancés"
            description="La configuration avancée est disponible avec l'abonnement premium."
          >
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Settings</h3>
              <p className="text-muted-foreground">Settings functionality will be implemented here.</p>
            </div>
          </PremiumFeatureGate>
        );
      default:
        return <Overview onCreateClick={() => setShowCreateModal(true)} />;
    }
  };

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || "User";
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentView={view} />
      
      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create QR Code
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-foreground">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {renderContent()}
        </main>
      </div>

      {/* Create QR Modal */}
      <EnhancedCreateQRModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
}
