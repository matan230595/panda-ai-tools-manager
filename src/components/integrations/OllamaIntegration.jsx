import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Download, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function OllamaIntegration({ endpoint = 'http://localhost:11434', onEndpointChange, onModelSelect, selectedModel }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState(endpoint);
  const [testingConnection, setTestingConnection] = useState(false);

  const testConnection = async (url) => {
    setTestingConnection(true);
    try {
      const response = await fetch(`${url}/api/tags`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        setIsConnected(true);
        toast.success('החיבור לOllama הצליח! ✅');
        if (onEndpointChange) onEndpointChange(url);
        return true;
      } else {
        setIsConnected(false);
        toast.error('Ollama לא מגיב - בדוק שהוא פועל');
        return false;
      }
    } catch (error) {
      setIsConnected(false);
      toast.error('לא ניתן להתחבר ל-Ollama. בדוק את ה-URL');
      return false;
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    testConnection(endpoint);
  }, []);

  const handlePullModel = async (modelName) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${currentEndpoint}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: false })
      });

      if (response.ok) {
        await testConnection(currentEndpoint);
        toast.success(`${modelName} הורד בהצלחה! 📥`);
      } else {
        toast.error('שגיאה בהורדת המודל');
      }
    } catch (error) {
      toast.error('שגיאה בתקשורת עם Ollama');
    } finally {
      setIsLoading(false);
    }
  };

  const popularModels = [
    { name: 'llama2', description: 'Llama 2 7B - מודל קוד פתוח מהיציב' },
    { name: 'mistral', description: 'Mistral 7B - מהיר ויעיל' },
    { name: 'neural-chat', description: 'Neural Chat - מעולה לשיחות' },
    { name: 'dolphin-mixtral', description: 'Dolphin Mixtral - חכם מאוד' },
    { name: 'openhermes', description: 'OpenHermes - קוד ו-reasoning' }
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            חיבור ל-Ollama
          </CardTitle>
          <CardDescription>הרץ מודלים AI מקומיים בחינם</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={currentEndpoint}
              onChange={(e) => setCurrentEndpoint(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1"
            />
            <Button
              onClick={() => testConnection(currentEndpoint)}
              disabled={testingConnection}
              variant="outline"
            >
              {testingConnection ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              בדוק
            </Button>
          </div>

          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            isConnected
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200'
          }`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-100">מחובר בהצלחה</div>
                  <div className="text-sm text-green-800 dark:text-green-200">{models.length} מודלים זמינים</div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <div className="font-semibold text-red-900 dark:text-red-100">לא מחובר</div>
                  <div className="text-sm text-red-800 dark:text-red-200">
                    וודא שOllama פועל: <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">ollama serve</code>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Local Models */}
      {isConnected && models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📦 מודלים מקומיים זמינים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {models.map(model => (
                <div
                  key={model.name}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedModel === model.name
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                  onClick={() => onModelSelect?.(model.name, 'ollama')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{model.name}</span>
                    {selectedModel === model.name && (
                      <Badge className="bg-green-500">בחירה</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <p>גודל: {(model.size / 1024 / 1024 / 1024).toFixed(1)} GB</p>
                    <p>שינוי אחרון: {new Date(model.modified_at).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Models to Download */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-500" />
              הורד מודלים נוספים
            </CardTitle>
            <CardDescription>בחר מודל להורדה ולהרצה מקומית</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {popularModels
                .filter(m => !models.some(model => model.name === m.name))
                .map(model => (
                  <div key={model.name} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">{model.name}</span>
                      <Button
                        size="sm"
                        onClick={() => handlePullModel(model.name)}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{model.description}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      {!isConnected && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">🚀 התקנת Ollama</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-3">
            <div>
              <p className="font-semibold mb-1">1. הורד Ollama:</p>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">https://ollama.ai</code>
            </div>
            <div>
              <p className="font-semibold mb-1">2. הרץ את השירות:</p>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">ollama serve</code>
            </div>
            <div>
              <p className="font-semibold mb-1">3. הורד מודל (בחלון אחר):</p>
              <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">ollama pull llama2</code>
            </div>
            <div>
              <p className="font-semibold mb-1">4. בדוק חיבור כאן:</p>
              <p className="text-xs">לחץ על כפתור "בדוק" למעלה</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}