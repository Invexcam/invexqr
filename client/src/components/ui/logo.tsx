import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        {/* Logo SVG avec QR code stylisé */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Fond gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          
          {/* Conteneur principal */}
          <rect 
            x="2" 
            y="2" 
            width="28" 
            height="28" 
            rx="6" 
            fill="url(#logoGradient)"
            className="drop-shadow-lg"
          />
          
          {/* Motif QR code stylisé */}
          {/* Coins du QR code */}
          <rect x="5" y="5" width="6" height="6" rx="1" fill="white" />
          <rect x="21" y="5" width="6" height="6" rx="1" fill="white" />
          <rect x="5" y="21" width="6" height="6" rx="1" fill="white" />
          
          {/* Points centraux des coins */}
          <rect x="7" y="7" width="2" height="2" fill="#3B82F6" />
          <rect x="23" y="7" width="2" height="2" fill="#3B82F6" />
          <rect x="7" y="23" width="2" height="2" fill="#3B82F6" />
          
          {/* Motif central stylisé avec "I" pour Invex */}
          <rect x="14" y="8" width="4" height="16" rx="1" fill="white" />
          <rect x="13" y="8" width="6" height="2" rx="1" fill="white" />
          <rect x="13" y="22" width="6" height="2" rx="1" fill="white" />
          
          {/* Points décoratifs */}
          <rect x="13" y="13" width="2" height="2" fill="#3B82F6" />
          <rect x="17" y="13" width="2" height="2" fill="#3B82F6" />
          <rect x="15" y="17" width="2" height="2" fill="#3B82F6" />
        </svg>
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent",
          textSizeClasses[size]
        )}>
          InvexQR
        </span>
      )}
    </div>
  );
}