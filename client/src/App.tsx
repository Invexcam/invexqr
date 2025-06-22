import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import PremiumFeatureGate from "@/components/PremiumFeatureGate";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Contact from "@/pages/contact";
import Subscription from "@/pages/subscription";
import Pricing from "@/pages/pricing";
import FirebaseTest from "@/pages/firebase-test";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/contact" component={Contact} />
          <Route path="/pricing" component={Pricing} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard/:view?" component={Dashboard} />
          <Route path="/contact">
            <PremiumFeatureGate 
              feature="Contact Support"
              description="Le support client prioritaire est réservé aux abonnés premium."
            >
              <Contact />
            </PremiumFeatureGate>
          </Route>
          <Route path="/subscription" component={Subscription} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
