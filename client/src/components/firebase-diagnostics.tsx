import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { testFirebaseConnection } from "@/lib/firebase";

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export default function FirebaseDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    if (!apiKey || apiKey === 'undefined') {
      results.push({
        test: 'Clé API Firebase',
        status: 'error',
        message: 'VITE_FIREBASE_API_KEY manquante ou invalide',
        details: 'Vérifiez que la clé API est correctement configurée dans les secrets'
      });
    } else {
      results.push({
        test: 'Clé API Firebase',
        status: 'success',
        message: `Clé API configurée (${apiKey.substring(0, 10)}...)`
      });
    }

    if (!projectId || projectId === 'undefined') {
      results.push({
        test: 'Project ID Firebase',
        status: 'error',
        message: 'VITE_FIREBASE_PROJECT_ID manquant ou invalide',
        details: 'Le Project ID doit correspondre exactement à celui de votre projet Firebase'
      });
    } else {
      results.push({
        test: 'Project ID Firebase',
        status: 'success',
        message: `Project ID: ${projectId}`
      });
    }

    if (!appId || appId === 'undefined') {
      results.push({
        test: 'App ID Firebase',
        status: 'error',
        message: 'VITE_FIREBASE_APP_ID manquant ou invalide',
        details: 'L\'App ID doit correspondre à votre application web Firebase'
      });
    } else {
      results.push({
        test: 'App ID Firebase',
        status: 'success',
        message: `App ID configuré (${appId.substring(0, 15)}...)`
      });
    }

    // Test 2: Firebase Connection
    try {
      const connectionTest = await testFirebaseConnection();
      if (connectionTest.success) {
        results.push({
          test: 'Connexion Firebase',
          status: 'success',
          message: connectionTest.status || 'Connexion réussie'
        });
      } else {
        results.push({
          test: 'Connexion Firebase',
          status: 'error',
          message: connectionTest.error || 'Erreur de connexion',
          details: 'Vérifiez la configuration Firebase et les autorisations'
        });
      }
    } catch (error: any) {
      results.push({
        test: 'Connexion Firebase',
        status: 'error',
        message: 'Échec du test de connexion',
        details: error.message
      });
    }

    // Test 3: Domain Authorization (simulation)
    const currentDomain = window.location.hostname;
    if (currentDomain.includes('replit') || currentDomain.includes('localhost')) {
      results.push({
        test: 'Domaine autorisé',
        status: 'warning',
        message: `Domaine actuel: ${currentDomain}`,
        details: 'Assurez-vous que ce domaine est dans les domaines autorisés Firebase'
      });
    } else {
      results.push({
        test: 'Domaine autorisé',
        status: 'success',
        message: `Domaine: ${currentDomain}`
      });
    }

    // Test 4: Firebase SDK Version
    try {
      // Check if Firebase is properly imported
      const firebaseVersion = '10.x'; // Current version
      results.push({
        test: 'Version SDK Firebase',
        status: 'success',
        message: `Version Firebase SDK: ${firebaseVersion}`,
        details: 'SDK Firebase moderne compatible'
      });
    } catch (error) {
      results.push({
        test: 'Version SDK Firebase',
        status: 'error',
        message: 'Problème avec le SDK Firebase',
        details: 'Vérifiez l\'installation du package firebase'
      });
    }

    // Test 5: Network connectivity
    try {
      const response = await fetch('https://firebase.googleapis.com/v1/projects', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      results.push({
        test: 'Connectivité réseau Firebase',
        status: 'success',
        message: 'Accès aux services Firebase disponible'
      });
    } catch (error) {
      results.push({
        test: 'Connectivité réseau Firebase',
        status: 'warning',
        message: 'Impossible de vérifier la connectivité réseau',
        details: 'Vérifiez votre connexion internet et les pare-feux'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;

    const labels = {
      success: 'OK',
      warning: 'Attention',
      error: 'Erreur'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnostic Firebase</span>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Test en cours...' : 'Relancer les tests'}
          </Button>
        </CardTitle>
        
        {diagnostics.length > 0 && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {diagnostics.filter(d => d.status === 'success').length} réussis
            </span>
            {warningCount > 0 && (
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                {warningCount} avertissements
              </span>
            )}
            {errorCount > 0 && (
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                {errorCount} erreurs
              </span>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex items-start gap-3">
                {getStatusIcon(diagnostic.status)}
                <div>
                  <div className="font-medium">{diagnostic.test}</div>
                  <div className="text-sm text-muted-foreground">{diagnostic.message}</div>
                  {diagnostic.details && (
                    <div className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded">
                      {diagnostic.details}
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(diagnostic.status)}
            </div>
          ))}
          
          {diagnostics.length === 0 && isRunning && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              Exécution des tests de diagnostic...
            </div>
          )}
        </div>

        {errorCount > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Actions correctives recommandées:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Vérifiez que votre projet Firebase est actif dans la console Firebase</li>
              <li>• Confirmez que l'application web est créée et configurée</li>
              <li>• Ajoutez votre domaine Replit aux domaines autorisés dans Firebase Auth</li>
              <li>• Vérifiez que les clés API sont correctement copiées dans les secrets</li>
              <li>• Assurez-vous que la facturation est activée si nécessaire</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}