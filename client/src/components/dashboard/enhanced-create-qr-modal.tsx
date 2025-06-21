import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Link, 
  FileText, 
  User, 
  Phone, 
  MessageSquare, 
  Mail, 
  FileImage, 
  Menu, 
  Music,
  Palette,
  Download,
  Settings
} from "lucide-react";

const baseQRSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["static", "dynamic"]),
  description: z.string().optional(),
});

const contentSchemas = {
  url: z.object({
    url: z.string().url("Please enter a valid URL"),
  }),
  text: z.object({
    text: z.string().min(1, "Text content is required"),
  }),
  vcard: z.object({
    name: z.string().min(1, "Name is required"),
    organization: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    website: z.string().url().optional().or(z.literal("")),
    note: z.string().optional(),
  }),
  phone: z.object({
    number: z.string().min(1, "Phone number is required"),
  }),
  sms: z.object({
    number: z.string().min(1, "Phone number is required"),
    message: z.string().optional(),
  }),
  email: z.object({
    address: z.string().email("Please enter a valid email"),
    subject: z.string().optional(),
    body: z.string().optional(),
  }),
  pdf: z.object({
    url: z.string().url("Please enter a valid PDF URL"),
    title: z.string().optional(),
  }),
  menu: z.object({
    url: z.string().url("Please enter a valid menu URL"),
    restaurantName: z.string().optional(),
  }),
  audio: z.object({
    url: z.string().url("Please enter a valid audio URL"),
    title: z.string().optional(),
  }),
};

const createQRSchema = baseQRSchema.extend({
  contentType: z.enum(["url", "text", "vcard", "phone", "sms", "email", "pdf", "menu", "audio"]),
  content: z.any(),
  style: z.object({
    pattern: z.enum(["default", "rounded", "dots", "squares", "elegant", "classic"]).default("default"),
    primaryColor: z.string().default("#000000"),
    backgroundColor: z.string().default("#FFFFFF"),
    size: z.number().min(128).max(1024).default(256),
    margin: z.number().min(0).max(10).default(2),
    errorCorrection: z.enum(["L", "M", "Q", "H"]).default("M"),
  }).default({}),
});

type CreateQRFormData = z.infer<typeof createQRSchema>;

interface EnhancedCreateQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  initialData?: any;
}

const contentTypeOptions = [
  { value: "url", label: "URL/Website", icon: Link, description: "Link to any website" },
  { value: "text", label: "Plain Text", icon: FileText, description: "Simple text content" },
  { value: "vcard", label: "Contact Card", icon: User, description: "Business card information" },
  { value: "phone", label: "Phone Number", icon: Phone, description: "Direct phone call" },
  { value: "sms", label: "SMS Message", icon: MessageSquare, description: "Text message" },
  { value: "email", label: "Email", icon: Mail, description: "Email composition" },
  { value: "pdf", label: "PDF Document", icon: FileImage, description: "PDF file link" },
  { value: "menu", label: "Restaurant Menu", icon: Menu, description: "Digital menu" },
  { value: "audio", label: "Audio File", icon: Music, description: "Audio content" },
];

const styleOptions = [
  { value: "default", label: "Default", description: "Standard square pattern" },
  { value: "rounded", label: "Rounded", description: "Rounded corners" },
  { value: "dots", label: "Dots", description: "Circular dots pattern" },
  { value: "squares", label: "Squares", description: "Enhanced squares" },
  { value: "elegant", label: "Elegant", description: "Sophisticated look" },
  { value: "classic", label: "Classic", description: "Traditional style" },
];

export default function EnhancedCreateQRModal({ open, onOpenChange, editMode = false, initialData }: EnhancedCreateQRModalProps) {
  const [selectedContentType, setSelectedContentType] = useState<string>(initialData?.contentType || "url");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const form = useForm<CreateQRFormData>({
    resolver: zodResolver(createQRSchema),
    defaultValues: editMode && initialData ? {
      name: initialData.name || "",
      type: initialData.type || "dynamic",
      contentType: initialData.contentType || "url",
      content: initialData.content || {},
      style: initialData.style || {
        pattern: "default",
        primaryColor: "#000000",
        backgroundColor: "#FFFFFF",
        size: 256,
        margin: 2,
        errorCorrection: "M",
      },
      description: initialData.description || "",
    } : {
      name: "",
      type: "dynamic",
      contentType: "url",
      content: {},
      style: {
        pattern: "default",
        primaryColor: "#000000",
        backgroundColor: "#FFFFFF",
        size: 256,
        margin: 2,
        errorCorrection: "M",
      },
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateQRFormData) => {
      // Transform data to match backend expectations
      const qrData = {
        name: data.name,
        originalUrl: data.contentType === "url" ? data.content.url : `https://app.invexqr.com/qr/${Date.now()}`,
        type: data.type,
        contentType: data.contentType,
        content: data.content,
        style: data.style,
        description: data.description,
      };
      
      if (editMode && initialData) {
        return apiRequest("PUT", `/api/qr-codes/${initialData.id}`, qrData);
      } else {
        // Use public endpoint for anonymous users, authenticated endpoint for logged-in users
        const endpoint = isAuthenticated ? "/api/qr-codes" : "/api/public/qr-codes";
        return apiRequest("POST", endpoint, qrData);
      }
    },
    onSuccess: (response) => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ["/api/qr-codes"] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/overview"] });
      }
      toast({
        title: editMode ? "QR Code Updated" : "QR Code Created",
        description: editMode 
          ? "Your QR code has been updated successfully." 
          : isAuthenticated 
            ? "Your QR code has been created successfully." 
            : "Your QR code has been created! Sign up to save and manage your QR codes.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create QR code.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateQRFormData) => {
    mutation.mutate(data);
  };

  const renderContentForm = () => {
    const selectedType = form.watch("contentType");
    
    switch (selectedType) {
      case "url":
        return (
          <FormField
            control={form.control}
            name="content.url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "text":
        return (
          <FormField
            control={form.control}
            name="content.text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your text content..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "vcard":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="content.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="content.website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional information..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "phone":
        return (
          <FormField
            control={form.control}
            name="content.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "sms":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Pre-filled message..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "email":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email subject..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Email message..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "pdf":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PDF URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/document.pdf" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Document name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "menu":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/menu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.restaurantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Restaurant name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "audio":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="content.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/audio.mp3" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content.title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audio Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Audio title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMode ? "Modifier QR Code" : "Créer QR Code Avancé"}</DialogTitle>
          <DialogDescription>
            {editMode ? "Modifiez votre QR code dynamique avec des options avancées" : "Générez des QR codes avec des types de contenu et des options de personnalisation avancées"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <div className="grid grid-cols-3 gap-3">
                          {contentTypeOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <Card 
                                key={option.value}
                                className={`cursor-pointer transition-colors hover:bg-accent ${
                                  field.value === option.value ? "ring-2 ring-primary" : ""
                                }`}
                                onClick={() => {
                                  field.onChange(option.value);
                                  setSelectedContentType(option.value);
                                }}
                              >
                                <CardContent className="p-3 text-center">
                                  <Icon className="h-6 w-6 mx-auto mb-2" />
                                  <p className="text-sm font-medium">{option.label}</p>
                                  <p className="text-xs text-muted-foreground">{option.description}</p>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {renderContentForm()}
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="style.pattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QR Code Style</FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          {styleOptions.map((option) => (
                            <Card 
                              key={option.value}
                              className={`cursor-pointer transition-colors hover:bg-accent ${
                                field.value === option.value ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => field.onChange(option.value)}
                            >
                              <CardContent className="p-3">
                                <p className="font-medium">{option.label}</p>
                                <p className="text-sm text-muted-foreground">{option.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="style.primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16 h-10" />
                              <Input {...field} placeholder="#000000" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style.backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" {...field} className="w-16 h-10" />
                              <Input {...field} placeholder="#FFFFFF" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="style.size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size: {field.value}px</FormLabel>
                        <FormControl>
                          <Slider
                            min={128}
                            max={1024}
                            step={16}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style.margin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margin: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={10}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style.errorCorrection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Error Correction Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select error correction level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="L">Low (7%)</SelectItem>
                            <SelectItem value="M">Medium (15%)</SelectItem>
                            <SelectItem value="Q">Quartile (25%)</SelectItem>
                            <SelectItem value="H">High (30%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QR Code Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My QR Code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QR Code Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="static">
                              <div className="flex items-center gap-2">
                                Static
                                <Badge variant="secondary">Fixed content</Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value="dynamic">
                              <div className="flex items-center gap-2">
                                Dynamic
                                <Badge variant="secondary">Editable after creation</Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Description of this QR code..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending 
                  ? (editMode ? "Modification..." : "Création...") 
                  : (editMode ? "Modifier QR Code" : "Créer QR Code")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}