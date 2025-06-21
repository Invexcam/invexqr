import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, Download, Eye, Link, Mail, Phone, Wifi, MessageSquare } from "lucide-react";
import QRCodeDisplay from "@/components/ui/qr-code-display";
import { generateQRCodeDataURL } from "@/lib/qr-generator";

const publicQRSchema = z.object({
  type: z.enum(["url", "text", "email", "phone", "sms", "wifi"]),
  name: z.string().min(1, "Le nom est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  // WiFi specific fields
  ssid: z.string().optional(),
  password: z.string().optional(),
  security: z.enum(["WPA", "WEP", "nopass"]).optional(),
  // Email specific fields
  subject: z.string().optional(),
  body: z.string().optional(),
  // SMS specific fields
  message: z.string().optional(),
});

type PublicQRFormData = z.infer<typeof publicQRSchema>;

interface PublicQRGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicQRGenerator({ open, onOpenChange }: PublicQRGeneratorProps) {
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [qrDataURL, setQrDataURL] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<PublicQRFormData>({
    resolver: zodResolver(publicQRSchema),
    defaultValues: {
      type: "url",
      name: "",
      content: "",
      security: "WPA",
    },
  });

  const watchedType = form.watch("type");

  const getQRContent = (data: PublicQRFormData): string => {
    switch (data.type) {
      case "url":
        return data.content.startsWith("http") ? data.content : `https://${data.content}`;
      case "email":
        const emailParams = new URLSearchParams();
        if (data.subject) emailParams.set("subject", data.subject);
        if (data.body) emailParams.set("body", data.body);
        const emailQuery = emailParams.toString();
        return `mailto:${data.content}${emailQuery ? `?${emailQuery}` : ""}`;
      case "phone":
        return `tel:${data.content}`;
      case "sms":
        return `sms:${data.content}${data.message ? `?body=${encodeURIComponent(data.message)}` : ""}`;
      case "wifi":
        return `WIFI:T:${data.security};S:${data.ssid};P:${data.password};H:false;;`;
      case "text":
      default:
        return data.content;
    }
  };

  const onSubmit = async (data: PublicQRFormData) => {
    setIsGenerating(true);
    try {
      const qrContent = getQRContent(data);
      setGeneratedQR(qrContent);
      
      // Generate QR code image
      const dataURL = await generateQRCodeDataURL(qrContent, {
        size: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });
      setQrDataURL(dataURL);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrDataURL) {
      const link = document.createElement("a");
      link.download = `${form.getValues("name")}_qrcode.png`;
      link.href = qrDataURL;
      link.click();
    }
  };

  const handleReset = () => {
    form.reset();
    setGeneratedQR(null);
    setQrDataURL(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "url": return Link;
      case "email": return Mail;
      case "phone": return Phone;
      case "sms": return MessageSquare;
      case "wifi": return Wifi;
      default: return QrCode;
    }
  };

  const getTypePlaceholder = (type: string) => {
    switch (type) {
      case "url": return "https://example.com";
      case "email": return "contact@example.com";
      case "phone": return "+237 6XX XXX XXX";
      case "sms": return "+237 6XX XXX XXX";
      case "wifi": return "Mon WiFi";
      case "text": return "Votre texte ici...";
      default: return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Générateur QR Code Gratuit
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du QR Code</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Mon QR Code"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Type de contenu</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value: any) => form.setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Site Web / URL
                      </div>
                    </SelectItem>
                    <SelectItem value="text">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4" />
                        Texte libre
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Téléphone
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="wifi">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4" />
                        WiFi
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic content fields based on type */}
              {watchedType === "wifi" ? (
                <>
                  <div>
                    <Label htmlFor="ssid">Nom du réseau (SSID)</Label>
                    <Input
                      id="ssid"
                      {...form.register("ssid")}
                      placeholder="MonWiFi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="motdepasse123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="security">Type de sécurité</Label>
                    <Select
                      value={form.watch("security")}
                      onValueChange={(value: any) => form.setValue("security", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">Aucun (Ouvert)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="content">
                    {watchedType === "url" && "URL du site web"}
                    {watchedType === "email" && "Adresse email"}
                    {watchedType === "phone" && "Numéro de téléphone"}
                    {watchedType === "sms" && "Numéro de téléphone"}
                    {watchedType === "text" && "Contenu texte"}
                  </Label>
                  {watchedType === "text" ? (
                    <Textarea
                      id="content"
                      {...form.register("content")}
                      placeholder={getTypePlaceholder(watchedType)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      id="content"
                      {...form.register("content")}
                      placeholder={getTypePlaceholder(watchedType)}
                    />
                  )}
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.content.message}</p>
                  )}
                </div>
              )}

              {/* Additional fields for email */}
              {watchedType === "email" && (
                <>
                  <div>
                    <Label htmlFor="subject">Sujet (optionnel)</Label>
                    <Input
                      id="subject"
                      {...form.register("subject")}
                      placeholder="Sujet de l'email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message (optionnel)</Label>
                    <Textarea
                      id="body"
                      {...form.register("body")}
                      placeholder="Corps du message"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Additional field for SMS */}
              {watchedType === "sms" && (
                <div>
                  <Label htmlFor="message">Message (optionnel)</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    placeholder="Votre message SMS"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? "Génération..." : "Générer QR Code"}
                </Button>
                {generatedQR && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Nouveau
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {generatedQR ? (
                  <>
                    <div className="p-4 bg-white rounded-lg border">
                      <QRCodeDisplay
                        value={generatedQR}
                        size={200}
                        className="mx-auto"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        QR Code généré avec succès !
                      </p>
                      <Button onClick={handleDownload} className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger PNG
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <QrCode className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Remplissez le formulaire pour générer votre QR code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Gratuit et sans limite :</strong> Générez autant de QR codes que vous voulez
              </p>
              <p>
                <strong>Pas de tracking :</strong> Vos QR codes sont statiques et ne sont pas suivis
              </p>
              <p>
                <strong>Créez un compte</strong> pour des QR codes dynamiques avec analytics
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}