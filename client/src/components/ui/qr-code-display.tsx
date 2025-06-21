import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  style?: {
    primaryColor?: string;
    backgroundColor?: string;
    margin?: number;
    errorCorrection?: "L" | "M" | "Q" | "H";
  };
}

export default function QRCodeDisplay({ 
  value, 
  size = 128, 
  className = "",
  style = {}
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      const options = {
        width: size,
        margin: style.margin || 2,
        color: {
          dark: style.primaryColor || "#000000",
          light: style.backgroundColor || "#FFFFFF",
        },
        errorCorrectionLevel: style.errorCorrection || "M" as const,
      };

      QRCode.toCanvas(canvasRef.current, value, options)
        .catch((error) => {
          console.error("Error generating QR code:", error);
        });
    }
  }, [value, size, style]);

  return (
    <canvas 
      ref={canvasRef}
      className={`border rounded ${className}`}
      width={size}
      height={size}
    />
  );
}