import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileImage, FileType } from "lucide-react";
import { generateQRCodeDataURL, generateQRCodeSVG } from "@/lib/qr-generator";
import { useToast } from "@/hooks/use-toast";

interface QRDownloadButtonProps {
  qrCode: {
    id: number;
    name: string;
    originalUrl: string;
    shortCode: string;
    contentType: string;
    content: any;
    style: any;
  };
}

export default function QRDownloadButton({ qrCode }: QRDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRContent = () => {
    // Always use tracking redirect URL for all QR codes
    return `${window.location.origin}/r/${qrCode.shortCode}`;
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      setIsGenerating(true);
      
      const content = generateQRContent();
      const options = {
        size: qrCode.style?.size || 256,
        margin: qrCode.style?.margin || 2,
        color: {
          dark: qrCode.style?.primaryColor || '#000000',
          light: qrCode.style?.backgroundColor || '#FFFFFF',
        },
        errorCorrectionLevel: qrCode.style?.errorCorrection || 'M',
      };

      let dataURL: string;
      let filename = qrCode.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (format === 'png') {
        dataURL = await generateQRCodeDataURL(content, options);
        filename += '.png';
      } else {
        const svgString = await generateQRCodeSVG(content, options);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        dataURL = URL.createObjectURL(blob);
        filename += '.svg';
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code téléchargé",
        description: `Le QR code a été téléchargé en format ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le QR code.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isGenerating}
          className="text-muted-foreground hover:text-primary"
          title="Télécharger le QR code"
        >
          <Download className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload('png')}>
          <FileImage className="h-4 w-4 mr-2" />
          PNG (Image)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload('svg')}>
          <FileType className="h-4 w-4 mr-2" />
          SVG (Vectoriel)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}