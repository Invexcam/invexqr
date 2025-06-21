import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, MousePointer, Calendar, TrendingUp, ExternalLink, Sun, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QRCodeDisplay from "@/components/ui/qr-code-display";
import { useLocation } from "wouter";

interface OverviewProps {
  onCreateClick: () => void;
}

export default function Overview({ onCreateClick }: OverviewProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: topPerforming, isLoading: topPerformingLoading } = useQuery({
    queryKey: ["/api/analytics/top-performing"],
  });

  const { data: recentQRCodes, isLoading: qrCodesLoading } = useQuery({
    queryKey: ["/api/qr-codes"],
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getQRCodeUrl = (shortCode: string) => {
    return `${window.location.origin}/r/${shortCode}`;
  };

  const handleQRCodeClick = (qrCode: any) => {
    const url = getQRCodeUrl(qrCode.shortCode);
    window.open(url, '_blank');
  };

  if (analyticsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bon matin";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
  };

  const getUserDisplayName = () => {
    if ((user as any)?.firstName && (user as any)?.lastName) {
      return `${(user as any).firstName} ${(user as any).lastName}`;
    }
    return (user as any)?.email?.split('@')[0] || "Utilisateur";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            {new Date().getHours() < 12 ? <Sun className="w-5 h-5 text-primary" /> : <Clock className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {getGreeting()}, {getUserDisplayName()} !
            </h2>
            <p className="text-muted-foreground text-sm">
              Voici un aperçu de vos QR codes et performances
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                +{Math.round(((analytics?.totalQRCodes || 0) / 30) * 100) || 0}%
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analytics?.totalQRCodes || 0}
            </div>
            <div className="text-muted-foreground text-sm">Total QR Codes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                +{Math.round(((analytics?.totalScans || 0) / (analytics?.totalQRCodes || 1)) * 10) || 0}%
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analytics?.totalScans?.toLocaleString() || 0}
            </div>
            <div className="text-muted-foreground text-sm">Total Scans</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                +{Math.round(((analytics?.scansToday || 0) / (analytics?.totalScans || 1)) * 100) || 0}%
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analytics?.scansToday || 0}
            </div>
            <div className="text-muted-foreground text-sm">Scans Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                +{Math.round(((analytics?.activeQRCodes || 0) / (analytics?.totalQRCodes || 1)) * 100) || 0}%
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {analytics?.activeQRCodes || 0}
            </div>
            <div className="text-muted-foreground text-sm">Active QR Codes</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent QR Codes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/90"
                  onClick={() => setLocation("/dashboard/qr-codes")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qrCodesLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))
                ) : recentQRCodes?.slice(0, 3).map((qr: any) => (
                  <div 
                    key={qr.id} 
                    className="flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors cursor-pointer group"
                    onClick={() => handleQRCodeClick(qr)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <QRCodeDisplay 
                          value={getQRCodeUrl(qr.shortCode)}
                          size={48}
                          className="border-2 border-border rounded-lg"
                          style={qr.style}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {qr.name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-64">
                          {qr.originalUrl}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={qr.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {qr.isActive ? "Actif" : "Pausé"}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className="text-xs"
                          >
                            {qr.type === "dynamic" ? "Dynamique" : "Statique"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {qr.scanCount?.toLocaleString() || 0} scans
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(qr.createdAt)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No QR codes yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first QR code to get started</p>
                    <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90">
                      Create QR Code
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top Performing</CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformingLoading ? (
                <div>
                  <Skeleton className="w-full h-32 rounded-lg mb-4" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPerforming && topPerforming.length > 0 ? (
                    topPerforming.slice(0, 3).map((qr: any, index: number) => (
                      <div key={qr.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            'bg-orange-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-foreground truncate max-w-32">
                              {qr.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              QR Code
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">
                            {qr.scanCount?.toLocaleString() || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            scans
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
