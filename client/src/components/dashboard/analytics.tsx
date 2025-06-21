import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { data: deviceBreakdown, isLoading: deviceLoading } = useQuery({
    queryKey: ["/api/analytics/device-breakdown"],
  });

  const { data: locationBreakdown, isLoading: locationLoading } = useQuery({
    queryKey: ["/api/analytics/location-breakdown"],
  });

  const { data: overview } = useQuery({
    queryKey: ["/api/analytics/overview"],
  });

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-primary" />;
      case "desktop":
        return <Monitor className="w-5 h-5 text-secondary" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-accent" />;
      default:
        return <Monitor className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return "bg-primary";
      case "desktop":
        return "bg-secondary";
      case "tablet":
        return "bg-accent";
      default:
        return "bg-muted-foreground";
    }
  };

  const calculatePercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const totalDeviceScans = deviceBreakdown?.reduce((sum: number, device: any) => sum + device.count, 0) || 0;

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Analytics</h2>
        <p className="text-muted-foreground">Detailed insights into your QR code performance</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Scan Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300" 
                alt="Analytics chart" 
                className="w-full h-64 object-cover rounded-lg" 
              />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    {overview?.totalScans?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Scans</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    {overview?.scansToday || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-foreground">
                    {Math.round((overview?.scansToday || 0) / 24)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg/Hour</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-5 h-5" />
                      <Skeleton className="w-16 h-4" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-24 h-2" />
                      <Skeleton className="w-8 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : deviceBreakdown && deviceBreakdown.length > 0 ? (
              <div className="space-y-4">
                {deviceBreakdown.map((device: any) => {
                  const percentage = calculatePercentage(device.count, totalDeviceScans);
                  return (
                    <div key={device.deviceType} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(device.deviceType)}
                        <span className="text-foreground capitalize">
                          {device.deviceType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress 
                          value={percentage} 
                          className="w-24"
                          // @ts-ignore
                          style={{
                            "--progress-background": `hsl(var(--muted))`,
                            "--progress-foreground": device.deviceType.toLowerCase() === "mobile" 
                              ? `hsl(var(--primary))` 
                              : device.deviceType.toLowerCase() === "desktop"
                              ? `hsl(var(--secondary))`
                              : `hsl(var(--accent))`
                          }}
                        />
                        <span className="text-sm font-medium text-foreground w-10 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No device data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Top Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {locationLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-muted rounded-xl">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : locationBreakdown && locationBreakdown.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {locationBreakdown.slice(0, 8).map((location: any, index: number) => (
                <div key={location.country} className="text-center p-4 bg-muted rounded-xl">
                  <div className="text-2xl font-bold text-foreground">
                    {location.count.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {location.country}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🌍</span>
              </div>
              <p className="text-muted-foreground">No location data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scan Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📊</span>
            </div>
            <p className="text-muted-foreground">Detailed scan timeline coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
