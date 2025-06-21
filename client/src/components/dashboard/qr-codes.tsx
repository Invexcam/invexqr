import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QrCode, Edit, Trash2, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import QRCodeDisplay from "@/components/ui/qr-code";
import QRDownloadButton from "@/components/qr-download-button";
import EnhancedCreateQRModal from "@/components/dashboard/enhanced-create-qr-modal";

interface QRCodesProps {
  onCreateClick: () => void;
}

export default function QRCodes({ onCreateClick }: QRCodesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingQR, setEditingQR] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ["/api/qr-codes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/qr-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete QR code",
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/qr-codes/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      toast({
        title: "Success",
        description: "QR code status updated",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update QR code status",
        variant: "destructive",
      });
    },
  });

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
    return `${window.location.origin}/qr/${shortCode}`;
  };

  const filteredQRCodes = qrCodes?.filter((qr: any) => {
    const matchesSearch = qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         qr.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || qr.type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && qr.isActive) ||
                         (statusFilter === "paused" && !qr.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <Skeleton className="h-10 flex-1 min-w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex space-x-2">
                    <Skeleton className="w-8 h-8" />
                    <Skeleton className="w-8 h-8" />
                  </div>
                </div>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">QR Codes</h2>
          <p className="text-muted-foreground">Manage all your QR codes in one place</p>
        </div>
        <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New QR Code
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search QR codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Grid */}
      {filteredQRCodes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {qrCodes?.length === 0 ? "No QR codes yet" : "No matching QR codes"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {qrCodes?.length === 0 
                ? "Create your first QR code to get started with tracking and analytics."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {qrCodes?.length === 0 && (
              <Button onClick={onCreateClick} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First QR Code
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
          {filteredQRCodes.map((qr: any) => (
            <Card key={qr.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white border-2 border-border rounded-lg p-2">
                    <QRCodeDisplay 
                      value={getQRCodeUrl(qr.shortCode)}
                      size={48}
                    />
                  </div>
                  <div className="flex space-x-2">
                    {qr.type === 'dynamic' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setEditingQR(qr)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <QRDownloadButton qrCode={qr} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate(qr.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2 truncate" title={qr.name}>
                  {qr.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 truncate" title={qr.originalUrl}>
                  {qr.originalUrl}
                </p>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Scans</span>
                  <span className="font-medium text-foreground">
                    {qr.scanCount?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-muted-foreground">
                    {formatTimeAgo(qr.createdAt)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <Badge 
                    variant={qr.isActive ? "default" : "secondary"}
                    className={`cursor-pointer ${
                      qr.isActive 
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => toggleStatusMutation.mutate({ 
                      id: qr.id, 
                      isActive: !qr.isActive 
                    })}
                  >
                    {qr.isActive ? "Active" : "Paused"}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {qr.type === "dynamic" ? "Dynamic" : "Static"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal for Dynamic QR Codes */}
      {editingQR && (
        <EnhancedCreateQRModal
          open={!!editingQR}
          onOpenChange={(open) => !open && setEditingQR(null)}
          editMode={true}
          initialData={editingQR}
        />
      )}
    </div>
  );
}
