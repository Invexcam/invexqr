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
    contentType: string;
    content: any;
    style: any;
  };
}

export default function QRDownloadButton({ qrCode }: QRDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRContent = () => {
    if (qrCode.contentType === 'url' && qrCode.content?.url) {
      return qrCode.content.url;
    }
    if (qrCode.contentType === 'text' && qrCode.content?.text) {
      return qrCode.content.text;
    }
    if (qrCode.contentType === 'vcard' && qrCode.content) {
      const vcard = qrCode.content;
      return `BEGIN:VCARD
VERSION:3.0
FN:${vcard.name || ''}
ORG:${vcard.organization || ''}
TEL:${vcard.phone || ''}
EMAIL:${vcard.email || ''}
URL:${vcard.website || ''}
NOTE:${vcard.note || ''}
END:VCARD`;
    }
    if (qrCode.contentType === 'phone' && qrCode.content?.number) {
      return `tel:${qrCode.content.number}`;
    }
    if (qrCode.contentType === 'sms' && qrCode.content?.number) {
      return `sms:${qrCode.content.number}${qrCode.content.message ? `?body=${encodeURIComponent(qrCode.content.message)}` : ''}`;
    }
    if (qrCode.contentType === 'email' && qrCode.content?.address) {
      const email = qrCode.content;
      return `mailto:${email.address}${email.subject ? `?subject=${encodeURIComponent(email.subject)}` : ''}${email.body ? `&body=${encodeURIComponent(email.body)}` : ''}`;
    }
    
    return qrCode.originalUrl;
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
        style: qrCode.style?.pattern || 'default',
      };

      let dataURL: string;
      let filename = qrCode.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      if (format === 'png') {
        dataURL = await generateQRCodeDataURL(content, options);
        filename += '.png';
      } else {
        const svgContent = await generateQRCodeSVG(content, options);
        dataURL = `data:image/svg+xml;base64,${btoa(svgContent)}`;
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
        <Button variant="outline" size="sm" disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Génération..." : "Télécharger"}
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