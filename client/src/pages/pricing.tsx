import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Shield, BarChart3, QrCode, Users, Globe } from "lucide-react";
import AuthModal from "@/components/auth/auth-modal";
import { Link } from "wouter";

export default function Pricing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    setShowAuthModal(true);
  };

  const features = [
    "QR codes dynamiques illimités",
    "Analytics avancées en temps réel", 
    "Personnalisation complète des designs",
    "Export haute résolution (PNG, SVG, PDF)",
    "Géolocalisation des scans",
    "Tracking multi-appareils",
    "API d'intégration",
    "Support technique prioritaire",
    "Domaines personnalisés",
    "White-label branding",
    "Rapports analytics détaillés",
    "Notifications email automatiques"
  ];

  const useCases = [
    {
      icon: BarChart3,
      title: "Marketing Digital",
      description: "Campagnes publicitaires avec tracking ROI complet"
    },
    {
      icon: QrCode,
      title: "E-commerce",
      description: "Catalogues produits et liens de paiement optimisés"
    },
    {
      icon: Users,
      title: "Événements",
      description: "Gestion des invitations et check-in automatisé"
    },
    {
      icon: Globe,
      title: "Restaurant & Retail",
      description: "Menus digitaux et systèmes de commande sans contact"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">InvexQR</span>
              </div>
            </Link>
            <Button onClick={handleGetStarted} className="bg-primary hover:bg-primary/90">
              Commencer maintenant
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Crown className="w-4 h-4 mr-1" />
            Offre CEO Exclusive
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Tarif Unique
            <span className="text-primary block">5$ par mois</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Accès complet à toutes les fonctionnalités premium d'InvexQR. 
            Solution professionnelle pour entrepreneurs, marketing agencies et enterprises.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Pas de frais cachés
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Annulation à tout moment
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              Support 24/7
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto mb-16">
          <Card className="relative border-2 border-primary shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-white px-6 py-2">
                <Star className="w-4 h-4 mr-1" />
                Plus Populaire
              </Badge>
            </div>
            
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
              <Button 
                onClick={handleGetStarted} 
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6 mb-6"
              >
                <Zap className="w-5 h-5 mr-2" />
                Activer maintenant
              </Button>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">
            Parfait pour tous les secteurs
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Une solution polyvalente adaptée aux besoins spécifiques de chaque industrie
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <useCase.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-gray-600">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurité Enterprise</h3>
              <p className="text-gray-600">
                Données cryptées, conformité RGPD, hébergement sécurisé en Europe
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Avancées</h3>
              <p className="text-gray-600">
                Tableaux de bord en temps réel, exports de données, rapports personnalisés
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Performance Optimale</h3>
              <p className="text-gray-600">
                CDN global, temps de réponse inférieur à 200ms, disponibilité 99.9%
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Questions Fréquentes</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je annuler à tout moment ?</h3>
                <p className="text-gray-600">
                  Oui, vous pouvez annuler votre abonnement à tout moment depuis votre dashboard. 
                  Aucun engagement de durée, aucune pénalité.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Y a-t-il des limites sur le nombre de QR codes ?</h3>
                <p className="text-gray-600">
                  Non, créez autant de QR codes que nécessaire. Aucune limite sur le nombre 
                  de codes ou de scans mensuels.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Le support technique est-il inclus ?</h3>
                <p className="text-gray-600">
                  Oui, support prioritaire 24/7 par email et chat. Assistance technique 
                  et aide à l'intégration incluses.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Puis-je utiliser mon propre domaine ?</h3>
                <p className="text-gray-600">
                  Absolument ! Configurez vos domaines personnalisés pour un branding 
                  complet de vos QR codes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à transformer votre business ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez les entreprises qui font confiance à InvexQR
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-lg px-12 py-6"
          >
            <Crown className="w-5 h-5 mr-2" />
            Commencer pour 5$/mois
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Activation immédiate • Paiement sécurisé par PayPal
          </p>
        </div>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}