import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: options.size || 256,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || "#000000",
      light: options.color?.light || "#FFFFFF",
    },
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
  };

  try {
    return await QRCode.toDataURL(text, defaultOptions);
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export async function generateQRCodeSVG(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions = {
    width: options.size || 256,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || "#000000",
      light: options.color?.light || "#FFFFFF",
    },
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
  };

  try {
    return await QRCode.toString(text, { 
      type: "svg",
      ...defaultOptions 
    });
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code SVG");
  }
}

export function downloadQRCode(dataURL: string, filename: string = "qrcode.png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
