import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap } from 'lucide-react';

interface PayPalSubscriptionProps {
  onSubscriptionSuccess?: (subscriptionId: string) => void;
}

export default function PayPalSubscription({ onSubscriptionSuccess }: PayPalSubscriptionProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current || !paypalRef.current) return;
    
    const loadPayPalScript = () => {
      // Check if PayPal SDK is already loaded
      if ((window as any).paypal) {
        renderPayPalButton();
        return;
      }

      // Remove any existing PayPal scripts first
      const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
      existingScripts.forEach(script => script.remove());

      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AaCQHpjm9MDLV7jcIKf9rRyVwL7f1O_RIIsMv0A9n1lH2T15gMyEQYrIps4YSV-sQcsNutjW_tJPj6X2&vault=true&intent=subscription';
      script.setAttribute('data-sdk-integration-source', 'button-factory');
      script.onload = () => {
        renderPayPalButton();
      };
      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
      };
      document.body.appendChild(script);
    };

    const renderPayPalButton = () => {
      if (!paypalRef.current || isLoaded.current) return;
      
      try {
        const paypal = (window as any).paypal;
        if (!paypal) {
          console.error('PayPal SDK not loaded');
          return;
        }
        
        // Clear any existing content
        paypalRef.current.innerHTML = '';
        
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
            height: 55
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: 'P-4F775898EU1340713NBLITJI'
            });
          },
          onApprove: function(data: any, actions: any) {
            console.log('Subscription approved:', data.subscriptionID);
            
            // Call success callback if provided
            if (onSubscriptionSuccess) {
              onSubscriptionSuccess(data.subscriptionID);
            }
            
            // Show success message
            alert(`Abonnement activé avec succès ! ID: ${data.subscriptionID}`);
            
            // Reload the page to refresh user permissions
            window.location.reload();
          },
          onError: function(err: any) {
            console.error('PayPal subscription error:', err);
            alert('Erreur lors de l\'activation de l\'abonnement. Veuillez réessayer.');
          },
          onCancel: function(data: any) {
            console.log('Subscription cancelled:', data);
            alert('Abonnement annulé.');
          }
        }).render(paypalRef.current).catch((error: any) => {
          console.error('PayPal render error:', error);
        });
        
        isLoaded.current = true;
      } catch (error) {
        console.error('PayPal button render error:', error);
      }
    };

    loadPayPalScript();

    return () => {
      // Cleanup function
      isLoaded.current = false;
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [onSubscriptionSuccess]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-yellow-500 mr-2" />
          <CardTitle className="text-2xl font-bold">InvexQR Premium</CardTitle>
        </div>
        <CardDescription>
          Accédez à toutes les fonctionnalités avancées d'InvexQR
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features list */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">QR codes dynamiques illimités</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">Analytics avancées en temps réel</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">Personnalisation complète des QR</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">Export haute résolution</span>
          </div>
          <div className="flex items-center space-x-3">
            <Check className="h-5 w-5 text-green-500" />
            <span className="text-sm">Support prioritaire</span>
          </div>
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium">Notifications email en temps réel</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center py-4 border-t border-b">
          <div className="text-3xl font-bold">5$</div>
          <div className="text-sm text-muted-foreground">par mois</div>
          <Badge variant="secondary" className="mt-2">
            Offre CEO Exclusive
          </Badge>
        </div>

        {/* PayPal Button */}
        <div 
          ref={paypalRef}
          id="paypal-button-container-P-4F775898EU1340713NBLITJI"
          className="min-h-[60px] flex items-center justify-center"
        >
          <div className="text-center text-muted-foreground">
            Chargement du bouton PayPal...
          </div>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Paiement sécurisé par PayPal. Vos données sont protégées.
        </div>
      </CardContent>
    </Card>
  );
}