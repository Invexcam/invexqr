import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Lock, Edit } from "lucide-react";

const createQRSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  originalUrl: z.string().url("Please enter a valid URL"),
  type: z.enum(["static", "dynamic"]),
  description: z.string().optional(),
});

type CreateQRFormData = z.infer<typeof createQRSchema>;

interface CreateQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateQRModal({ open, onOpenChange }: CreateQRModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateQRFormData>({
    resolver: zodResolver(createQRSchema),
    defaultValues: {
      name: "",
      originalUrl: "",
      type: "dynamic",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateQRFormData) => {
      const response = await apiRequest("POST", "/api/qr-codes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      toast({
        title: "Success",
        description: "QR code created successfully",
      });
      onOpenChange(false);
      form.reset();
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
        description: "Failed to create QR code",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateQRFormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Create New QR Code
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              QR Code Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Summer Campaign 2024"
              {...form.register("name")}
              className="mt-2"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          
          <div>
            <Label className="text-sm font-medium text-foreground">QR Code Type</Label>
            <RadioGroup
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as "static" | "dynamic")}
              className="mt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <Label className="relative cursor-pointer">
                  <RadioGroupItem value="static" className="sr-only" />
                  <div className={`p-4 border-2 rounded-xl transition-colors ${
                    form.watch("type") === "static" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Lock className={`w-5 h-5 ${
                        form.watch("type") === "static" ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div>
                        <div className="font-medium text-foreground">Static</div>
                        <div className="text-sm text-muted-foreground">Cannot be edited after creation</div>
                      </div>
                    </div>
                  </div>
                </Label>
                <Label className="relative cursor-pointer">
                  <RadioGroupItem value="dynamic" className="sr-only" />
                  <div className={`p-4 border-2 rounded-xl transition-colors ${
                    form.watch("type") === "dynamic" 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Edit className={`w-5 h-5 ${
                        form.watch("type") === "dynamic" ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <div>
                        <div className="font-medium text-foreground">Dynamic</div>
                        <div className="text-sm text-muted-foreground">Can be updated anytime</div>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="originalUrl" className="text-sm font-medium text-foreground">
              Destination URL
            </Label>
            <Input
              id="originalUrl"
              type="url"
              placeholder="https://example.com"
              {...form.register("originalUrl")}
              className="mt-2"
            />
            {form.formState.errors.originalUrl && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.originalUrl.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add a description for your QR code"
              rows={3}
              {...form.register("description")}
              className="mt-2"
            />
          </div>
          
          <div className="flex gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create QR Code"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
