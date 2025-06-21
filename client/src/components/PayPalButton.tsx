import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, ExternalLink } from 'lucide-react';

interface PayPalButtonProps {
  onSubscriptionSuccess?: (subscriptionId: string) => void;
}

export default function PayPalButton({ onSubscriptionSuccess }: PayPalButtonProps) {
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectPayPal = () => {
    // Direct PayPal subscription link - safer approach
    const subscriptionUrl = `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-4F775898EU1340713NBLITJI`;
    window.open(subscriptionUrl, '_blank');
  };

  useEffect(() => {
    // Check if PayPal SDK is available
    if (typeof (window as any).paypal !== 'undefined') {
      setPaypalLoaded(true);
    } else {
      // Set a timeout to check again
      const timer = setTimeout(() => {
        if (typeof (window as any).paypal !== 'undefined') {
          setPaypalLoaded(true);
        } else {
          setError('PayPal SDK non disponible');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-red-600 mb-4">
          Problème de chargement PayPal
        </div>
        <Button 
          onClick={handleDirectPayPal}
          className="w-full bg-[#0070ba] hover:bg-[#003087] text-white"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          S'abonner via PayPal
        </Button>
        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/pricing'} 
            variant="outline"
            className="text-sm"
          >
            <Crown className="w-4 h-4 mr-2" />
            Voir tous les détails
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600 mb-4">
        Abonnement sécurisé via PayPal
      </div>
      
      <Button 
        onClick={handleDirectPayPal}
        className="w-full bg-[#0070ba] hover:bg-[#003087] text-white h-12"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.232c-.547-.168-1.193-.232-1.907-.232h-2.592c-.524 0-.968.381-1.05.9L14.45 9.56c-.065.417.24.777.667.777h1.357c2.422 0 4.75-1.584 5.15-5.42z"/>
        </svg>
        S'abonner pour 5$/mois
      </Button>

      <div className="text-center">
        <Button 
          onClick={() => window.location.href = '/pricing'} 
          variant="outline"
          className="text-sm"
        >
          <Crown className="w-4 h-4 mr-2" />
          Voir tous les détails
        </Button>
      </div>

      <div className="text-xs text-center text-gray-500">
        Paiement sécurisé • Annulable à tout moment
      </div>
    </div>
  );
}