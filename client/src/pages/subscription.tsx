import { useAuth } from '@/hooks/useAuth';
import PayPalButton from '@/components/PayPalButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Subscription() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour accéder à l'abonnement Premium.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      // Save subscription to backend
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          planId: 'P-4F775898EU1340713NBLITJI',
          status: 'ACTIVE'
        }),
      });

      if (response.ok) {
        setHasActiveSubscription(true);
        toast({
          title: "Abonnement activé !",
          description: "Vous avez maintenant accès à toutes les fonctionnalités Premium d'InvexQR.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  if (hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Abonnement Premium Actif
              </CardTitle>
              <CardDescription>
                Vous avez maintenant accès à toutes les fonctionnalités d'InvexQR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Votre abonnement Premium est actif. Profitez de toutes les fonctionnalités avancées !
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour au Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Passez à InvexQR Premium
          </h1>
          <p className="text-xl text-gray-600">
            Débloquez toutes les fonctionnalités pour créer des QR codes professionnels
          </p>
        </div>

        {/* Subscription Card */}
        <div className="max-w-md mx-auto">
          <Card className="relative border-2 border-primary shadow-2xl">
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-3xl font-bold">Plan CEO</CardTitle>
              <div className="text-5xl font-bold text-primary my-4">
                5$
                <span className="text-lg text-gray-500 font-normal">/mois</span>
              </div>
              <p className="text-gray-600">
                Toutes les fonctionnalités premium incluses
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-8">
              <PayPalButton onSubscriptionSuccess={handleSubscriptionSuccess} />
            </CardContent>
          </Card>
        </div>

        {/* Back to dashboard */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Dashboard
            </Button>
          </Link>
        </div>

        {/* Security notice */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 inline mr-1" />
          Paiement 100% sécurisé avec cryptage SSL
        </div>
      </div>
    </div>
  );
}