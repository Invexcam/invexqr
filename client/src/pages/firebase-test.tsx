import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TestTube, Settings } from "lucide-react";
import { Link } from "wouter";
import FirebaseDiagnostics from "@/components/firebase-diagnostics";
import { signInWithEmail, signUpWithEmail, resetPassword, logOut } from "@/lib/firebase";

export default function FirebaseTest() {
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSignIn = async () => {
    if (!testEmail || !testPassword) {
      setTestResult({ type: 'error', message: 'Veuillez saisir un email et un mot de passe' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await signInWithEmail(testEmail, testPassword);
      if (result.error) {
        setTestResult({ type: 'error', message: result.error });
      } else {
        setTestResult({ type: 'success', message: 'Connexion réussie! Firebase fonctionne correctement.' });
      }
    } catch (error: any) {
      setTestResult({ type: 'error', message: `Erreur inattendue: ${error.message}` });
    }

    setIsLoading(false);
  };

  const testSignUp = async () => {
    if (!testEmail || !testPassword) {
      setTestResult({ type: 'error', message: 'Veuillez saisir un email et un mot de passe' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await signUpWithEmail(testEmail, testPassword);
      if (result.error) {
        setTestResult({ type: 'error', message: result.error });
      } else {
        setTestResult({ type: 'success', message: 'Inscription réussie! Firebase fonctionne correctement.' });
      }
    } catch (error: any) {
      setTestResult({ type: 'error', message: `Erreur inattendue: ${error.message}` });
    }

    setIsLoading(false);
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      setTestResult({ type: 'error', message: 'Veuillez saisir un email' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await resetPassword(testEmail);
      if (result.error) {
        setTestResult({ type: 'error', message: result.error });
      } else {
        setTestResult({ type: 'success', message: 'Email de réinitialisation envoyé! Firebase fonctionne correctement.' });
      }
    } catch (error: any) {
      setTestResult({ type: 'error', message: `Erreur inattendue: ${error.message}` });
    }

    setIsLoading(false);
  };

  const testLogout = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await logOut();
      if (result.error) {
        setTestResult({ type: 'error', message: result.error });
      } else {
        setTestResult({ type: 'success', message: 'Déconnexion réussie! Firebase fonctionne correctement.' });
      }
    } catch (error: any) {
      setTestResult({ type: 'error', message: `Erreur inattendue: ${error.message}` });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <TestTube className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">Test Firebase</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="diagnostics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="diagnostics" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Diagnostic
            </TabsTrigger>
            <TabsTrigger value="test-auth" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test Authentification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnostics">
            <FirebaseDiagnostics />
          </TabsContent>

          <TabsContent value="test-auth">
            <Card>
              <CardHeader>
                <CardTitle>Test des fonctions d'authentification Firebase</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Testez les différentes fonctions Firebase pour identifier les problèmes de configuration.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="test-email">Email de test</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-password">Mot de passe de test</Label>
                    <Input
                      id="test-password"
                      type="password"
                      placeholder="Mot de passe (min. 6 caractères)"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={testSignIn} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Test...' : 'Connexion'}
                  </Button>
                  <Button 
                    onClick={testSignUp} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Test...' : 'Inscription'}
                  </Button>
                  <Button 
                    onClick={testPasswordReset} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Test...' : 'Reset mot de passe'}
                  </Button>
                  <Button 
                    onClick={testLogout} 
                    disabled={isLoading}
                    variant="outline"
                  >
                    {isLoading ? 'Test...' : 'Déconnexion'}
                  </Button>
                </div>

                {testResult && (
                  <Alert className={testResult.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <AlertDescription className={testResult.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Guide de résolution des problèmes:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><strong>auth/invalid-api-key:</strong> Vérifiez VITE_FIREBASE_API_KEY dans les secrets</li>
                    <li><strong>auth/app-not-authorized:</strong> Ajoutez votre domaine aux domaines autorisés Firebase</li>
                    <li><strong>auth/project-not-found:</strong> Vérifiez VITE_FIREBASE_PROJECT_ID</li>
                    <li><strong>Configuration Firebase:</strong> Assurez-vous que l'app web est créée dans Firebase Console</li>
                    <li><strong>Authentification:</strong> Activez Email/Password dans Firebase Auth</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}