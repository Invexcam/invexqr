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
  description, 
  fallback 
}: PremiumFeatureGateProps) {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isPremium) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Lock className="h-8 w-8 text-yellow-500 mr-2" />
          <Crown className="h-6 w-6 text-yellow-500" />
        </div>
        <CardTitle className="text-lg">Fonctionnalité Premium</CardTitle>
        <CardDescription>
          {description || `Accédez à ${feature} avec InvexQR Premium`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette fonctionnalité nécessite un abonnement Premium pour être utilisée.
        </p>
        <Link href="/subscription">
          <Button className="w-full">
            <Crown className="h-4 w-4 mr-2" />
            Passer à Premium
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}