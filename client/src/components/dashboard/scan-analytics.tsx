import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Globe, MapPin, Monitor, Smartphone, Tablet, Calendar, TrendingUp, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ScanAnalyticsProps {
  qrCodeId?: number;
}

export default function ScanAnalytics({ qrCodeId }: ScanAnalyticsProps) {
  const [timeFilter, setTimeFilter] = useState("7d");
  
  const { data: scans, isLoading } = useQuery({
    queryKey: qrCodeId ? [`/api/analytics/qr/${qrCodeId}/scans`] : ["/api/analytics/scans"],
    enabled: !!qrCodeId,
  });

  const { data: locationBreakdown } = useQuery({
    queryKey: ["/api/analytics/location-breakdown"],
  });

  const { data: deviceBreakdown } = useQuery({
    queryKey: ["/api/analytics/device-breakdown"],
  });

  // Process scan data for charts
  const processScanData = () => {
    if (!scans) return { daily: [], hourly: [], countries: [] };

    // Group scans by date
    const dailyScans = scans.reduce((acc: any, scan: any) => {
      const date = new Date(scan.scannedAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Group scans by hour
    const hourlyScans = scans.reduce((acc: any, scan: any) => {
      const hour = new Date(scan.scannedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    // Group scans by country
    const countryScans = scans.reduce((acc: any, scan: any) => {
      const country = scan.country || "Unknown";
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    return {
      daily: Object.entries(dailyScans).map(([date, count]) => ({ date, scans: count })),
      hourly: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour}:00`,
        scans: hourlyScans[hour] || 0,
      })),
      countries: Object.entries(countryScans).map(([country, count]) => ({ country, scans: count })),
    };
  };

  const { daily, hourly, countries } = processScanData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const deviceIcons = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {qrCodeId ? "for this QR code" : "across all QR codes"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countries.length}</div>
            <p className="text-xs text-muted-foreground">
              unique countries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hourly.length > 0 
                ? hourly.reduce((max, curr) => curr.scans > max.scans ? curr : max).hour
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              most active time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Device</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {deviceBreakdown?.length > 0 
                ? deviceBreakdown.reduce((max: any, curr: any) => curr.count > max.count ? curr : max).deviceType
                : "N/A"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              most used device
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="scans" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="scans">Scan Activity</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>
          
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="scans" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Scans</CardTitle>
                <CardDescription>Scan activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="scans" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>Scans by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="scans" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Scan distribution by country</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={countries}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ country, percent }) => `${country} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="scans"
                    >
                      {countries.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>Detailed breakdown by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationBreakdown?.slice(0, 10).map((location: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{location.country}</span>
                      </div>
                      <Badge variant="outline">{location.count} scans</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>Scans by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deviceBreakdown?.map((device: any, index: number) => {
                  const Icon = deviceIcons[device.deviceType as keyof typeof deviceIcons] || Monitor;
                  return (
                    <div key={index} className="text-center p-4 border rounded-lg">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{device.count}</div>
                      <div className="text-sm text-muted-foreground capitalize">{device.deviceType}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Scans */}
      {scans?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Latest scan activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scans.slice(0, 10).map((scan: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">
                        {scan.country}, {scan.city}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {scan.deviceType} • {new Date(scan.scannedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {scan.ipAddress}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}