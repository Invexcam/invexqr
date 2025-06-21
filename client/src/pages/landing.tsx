import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, BarChart3, Link, Palette, Shield, Code, Users, TrendingUp, Menu, X } from "lucide-react";
import AuthModal from "@/components/auth/auth-modal";
import PublicQRGenerator from "@/components/public-qr-generator";
import { useQuery } from "@tanstack/react-query";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateQR, setShowCreateQR] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch public statistics with auto-refresh every 30 seconds
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/public/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000,
  });

  const handleLogin = () => {
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const handleCreateQR = () => {
    setShowCreateQR(true);
    setMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: QrCode,
      title: "Dynamic QR Codes",
      description: "Create QR codes that can be updated anytime without reprinting. Perfect for campaigns and marketing materials.",
      color: "text-primary"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track scans, locations, devices, and user behavior with detailed analytics dashboards and reports.",
      color: "text-secondary"
    },
    {
      icon: Link,
      title: "Smart Redirects",
      description: "Advanced redirect management with A/B testing, geo-targeting, and device-specific routing capabilities.",
      color: "text-accent"
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "Customize QR codes with your brand colors, logos, and styles to maintain consistent brand identity.",
      color: "text-warning"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with SSL encryption, secure data storage, and compliance with industry standards.",
      color: "text-blue-500"
    },
    {
      icon: Code,
      title: "Developer API",
      description: "Integrate QR code generation and analytics into your applications with our comprehensive REST API.",
      color: "text-green-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">InvexQR</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
              <Button variant="ghost" onClick={handleLogin} className="text-primary hover:text-primary/90">
                Login
              </Button>
              <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg z-50">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" onClick={handleLinkClick} className="block text-muted-foreground hover:text-primary transition-colors py-2">
                Features
              </a>
              <a href="#pricing" onClick={handleLinkClick} className="block text-muted-foreground hover:text-primary transition-colors py-2">
                Pricing
              </a>
              <a href="/contact" onClick={handleLinkClick} className="block text-muted-foreground hover:text-primary transition-colors py-2">
                Contact
              </a>
              <div className="pt-2 border-t space-y-2">
                <Button variant="ghost" onClick={handleLogin} className="w-full justify-start text-primary hover:text-primary/90 h-10">
                  Login
                </Button>
                <Button onClick={handleLogin} className="w-full bg-primary hover:bg-primary/90 h-10">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                  Dynamic QR Code
                  <span className="text-primary"> Generator</span>
                  with Real-Time Statistics
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create, customize and track your QR codes with ease. Our professional solution allows you to generate static or dynamic QR codes, with modifiable redirection and detailed analytics. Perfect for businesses, commerce, institutions and creators in Africa and internationally. Multi-user platform, intuitive interface, securely hosted data.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                  14-Day Free Trial
                </Button>
                <Button onClick={handleCreateQR} variant="outline" size="lg" className="text-lg px-8 py-4">
                  <QrCode className="w-5 h-5 mr-2" />
                  Generate Free QR Code
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  No credit card required
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Modern office workspace" 
                  className="rounded-2xl shadow-2xl w-full" 
                />
                {/* Real-time Statistics Cards */}
                <div className="absolute -bottom-8 -left-8 space-y-4">
                  {/* Total Scans Card */}
                  <Card className="shadow-lg border bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Total Scans</div>
                          <div className="text-lg font-bold text-foreground">
                            {isLoading ? "..." : ((stats as any)?.totalScans?.toLocaleString() || "0")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* QR Codes Generated Card */}
                  <Card className="shadow-lg border bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <QrCode className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">QR Codes Generated</div>
                          <div className="text-lg font-bold text-foreground">
                            {isLoading ? "..." : ((stats as any)?.totalQRCodes?.toLocaleString() || "0")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats on the Right */}
                <div className="absolute -bottom-8 -right-8 space-y-4">
                  {/* Users Card */}
                  <Card className="shadow-lg border bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Active Users</div>
                          <div className="text-lg font-bold text-foreground">
                            {isLoading ? "..." : ((stats as any)?.totalUsers?.toLocaleString() || "0")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Today's Scans Card */}
                  <Card className="shadow-lg border bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Scans Today</div>
                          <div className="text-lg font-bold text-foreground">
                            {isLoading ? "..." : ((stats as any)?.scansToday?.toLocaleString() || "0")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Modern Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, manage, and track QR codes with enterprise-grade analytics and reliability.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className={`w-12 h-12 bg-${feature.color.split('-')[1]}/10 rounded-xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your QR Code Management?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses using InvexQR to create, track, and optimize their QR code campaigns.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">InvexQR</span>
            </div>
            <p className="text-gray-400">
              © 2024 InvexQR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      
      {/* Create QR Modal */}
      <PublicQRGenerator 
        open={showCreateQR} 
        onOpenChange={setShowCreateQR}
      />
    </div>
  );
}
