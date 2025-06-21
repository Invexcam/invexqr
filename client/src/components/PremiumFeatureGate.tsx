import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'wouter';

interface PremiumFeatureGateProps {
  children: ReactNode;
  feature: string;
  description?: string;
  fallback?: ReactNode;
}

export default function PremiumFeatureGate({ 
  children, 
  feature, 
  description = "Cette fonctionnalité nécessite un abonnement premium.",
  fallback 
}: PremiumFeatureGateProps) {
  const { hasActiveSubscription, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Fonctionnalité Premium
        </CardTitle>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-gray-600">
          <strong>{feature}</strong> est disponible avec l'abonnement InvexQR Premium.
        </p>
        <div className="space-y-2">
          <Link href="/pricing">
            <Button className="w-full bg-primary hover:bg-primary/90">
              <Crown className="w-4 h-4 mr-2" />
              Découvrir Premium - 5$/mois
            </Button>
          </Link>
          <Link href="/subscription">
            <Button variant="outline" className="w-full">
              S'abonner maintenant
            </Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Accès illimité • Support prioritaire • Toutes les fonctionnalités
        </p>
      </CardContent>
    </Card>
  );
}