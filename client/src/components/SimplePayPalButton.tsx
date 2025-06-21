import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

interface SimplePayPalButtonProps {
  onSubscriptionSuccess?: (subscriptionId: string) => void;
}

export default function SimplePayPalButton({ onSubscriptionSuccess }: SimplePayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current || !containerRef.current) return;

    const initPayPal = () => {
      try {
        const paypal = (window as any).paypal;
        if (!paypal || !containerRef.current) return;

        mountedRef.current = true;
        
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: 'P-4F775898EU1340713NBLITJI'
            });
          },
          onApprove: function(data: any) {
            if (onSubscriptionSuccess) {
              onSubscriptionSuccess(data.subscriptionID);
            }
            alert(`Abonnement activé ! ID: ${data.subscriptionID}`);
            window.location.reload();
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            alert('Erreur PayPal. Veuillez réessayer.');
          }
        }).render(containerRef.current);
      } catch (error) {
        console.error('PayPal init error:', error);
      }
    };

    if ((window as any).paypal) {
      initPayPal();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AaCQHpjm9MDLV7jcIKf9rRyVwL7f1O_RIIsMv0A9n1lH2T15gMyEQYrIps4YSV-sQcsNutjW_tJPj6X2&vault=true&intent=subscription';
      script.onload = initPayPal;
      document.head.appendChild(script);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [onSubscriptionSuccess]);

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="min-h-[55px] flex items-center justify-center"
      />
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