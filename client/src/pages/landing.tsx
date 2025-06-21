import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, BarChart3, Link, Palette, Shield, Code } from "lucide-react";
import AuthModal from "@/components/auth/auth-modal";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogin = () => {
    setShowAuthModal(true);
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
      <nav className="bg-white shadow-sm border-b">
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
              <a href="#analytics" className="text-muted-foreground hover:text-primary transition-colors">
                Analytics
              </a>
              <Button variant="ghost" onClick={handleLogin} className="text-primary hover:text-primary/90">
                Sign In
              </Button>
              <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 to-accent/5 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                  Generate & Track
                  <span className="text-primary"> QR Codes</span>
                  Like a Pro
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Create dynamic QR codes, manage redirections, and track real-time analytics with our powerful SaaS platform. Perfect for businesses of all sizes.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-secondary mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Free 14-day trial
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
                <Card className="absolute -bottom-6 -left-6 shadow-lg border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Scans Today</div>
                        <div className="text-2xl font-bold text-foreground">12,847</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
    </div>
  );
}
