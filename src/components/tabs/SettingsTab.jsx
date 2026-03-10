import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Key, Palette, Download, Trash2, Save, AlertCircle, ExternalLink, CheckCircle, Zap, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import OllamaIntegration from '@/components/integrations/OllamaIntegration';
import BrandingTab from '@/components/tabs/BrandingTab';
import FooterSettingsTab from '@/components/tabs/FooterSettingsTab';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import CollaborationPanel from '../CollaborationPanel.jsx';
import GoogleCalendarSync from '../GoogleCalendarSync.jsx';
import AdvancedAnalytics from '../analytics/AdvancedAnalytics.jsx';

export default function SettingsTab({ settings, onLogout }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    geminiApiKey: settings?.geminiApiKey || '',
    groqApiKey: settings?.groqApiKey || '',
    mistralApiKey: settings?.mistralApiKey || '',
    cohereApiKey: settings?.cohereApiKey || '',
    huggingfaceApiKey: settings?.huggingfaceApiKey || '',
    togetherApiKey: settings?.togetherApiKey || '',
    claudeApiKey: settings?.claudeApiKey || '',
    openaiApiKey: settings?.openaiApiKey || '',
    ollamaEndpoint: settings?.ollamaEndpoint || 'http://localhost:11434',
    localaiBudget: settings?.localaiBudget || 'http://localhost:8080',
    preferredModel: settings?.preferredModel || 'groq',
    useLocalModelsOnly: settings?.useLocalModelsOnly ?? false,
    trackApiCosts: settings?.trackApiCosts ?? true,
    monthlyApibudget: settings?.monthlyApibudget || 100,
    theme: settings?.theme || 'light',
    viewMode: settings?.viewMode || 'grid',
    sortBy: settings?.sortBy || 'updated',
    enableNotifications: settings?.enableNotifications ?? true,
    enableKeyboardShortcuts: settings?.enableKeyboardShortcuts ?? true,
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});

  const apiProviders = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      key: 'geminiApiKey',
      url: 'https://makersuite.google.com/app/apikey',
      description: 'מודל מתקדם של Google עם יכולות מולטימודליות',
      free: '60 בקשות לדקה',
      models: 'Gemini Pro, Gemini Pro Vision',
      steps: [
        'היכנס ל-Google AI Studio',
        'לחץ על "Get API Key"',
        'צור מפתח חדש או השתמש בקיים',
        'העתק את המפתח והדבק כאן'
      ]
    },
    {
      id: 'groq',
      name: 'Groq',
      key: 'groqApiKey',
      url: 'https://console.groq.com',
      description: 'מהיר ביותר! עד 500 tokens/sec 🚀',
      free: '14,400 בקשות ליום',
      models: 'Llama 3, Mixtral, Gemma',
      steps: [
        'הירשם ב-Groq Console',
        'לך ל-API Keys',
        'צור מפתח חדש',
        'העתק והדבק כאן'
      ]
    },
    {
      id: 'mistral',
      name: 'Mistral AI',
      key: 'mistralApiKey',
      url: 'https://console.mistral.ai',
      description: 'מודלים אירופאיים מתקדמים',
      free: 'טיר חינמי זמין',
      models: 'Mistral 7B, Mixtral 8x7B',
      steps: [
        'הירשם ב-Mistral Console',
        'צור מפתח API חדש',
        'העתק את המפתח',
        'הדבק כאן'
      ]
    },
    {
      id: 'cohere',
      name: 'Cohere',
      key: 'cohereApiKey',
      url: 'https://dashboard.cohere.com',
      description: 'מודלים עסקיים ומתקדמים',
      free: 'Trial API זמין',
      models: 'Command, Command Light',
      steps: [
        'הירשם ב-Cohere',
        'לך ל-API Keys',
        'צור Trial Key',
        'הדבק כאן'
      ]
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      key: 'huggingfaceApiKey',
      url: 'https://huggingface.co/settings/tokens',
      description: 'גישה למאות מודלים בקוד פתוח',
      free: 'חינמי עם rate limits',
      models: 'מאות מודלים',
      steps: [
        'הירשם ב-Hugging Face',
        'לך להגדרות > Access Tokens',
        'צור Read token',
        'הדבק כאן'
      ]
    },
    {
      id: 'together',
      name: 'Together AI',
      key: 'togetherApiKey',
      url: 'https://together.ai',
      description: 'פלטפורמה לריצת מודלים בענן',
      free: '$25 credit חינם',
      models: 'Llama 3, Mistral, ועוד',
      steps: [
        'הירשם ב-Together AI',
        'קבל $25 credit',
        'צור API Key',
        'הדבק כאן'
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude 3.5',
      key: 'claudeApiKey',
      url: 'https://console.anthropic.com',
      description: 'Claude 3.5 Sonnet - מודל מתקדם ביותר לחשיבה מורכבת',
      free: '$5 credit חינם',
      models: 'Claude 3.5 Sonnet, Opus, Haiku',
      category: 'paid',
      steps: [
        'הירשם ב-Anthropic Console',
        'קבל $5 credit חינם',
        'צור API Key חדש',
        'הדבק כאן'
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-4o',
      key: 'openaiApiKey',
      url: 'https://platform.openai.com/api-keys',
      description: 'GPT-4o - מודל דור חדש עם ראיית חזון',
      free: '$5 credit חינם',
      models: 'GPT-4o, GPT-4 Turbo, GPT-3.5',
      category: 'paid',
      steps: [
        'הירשם ב-OpenAI Platform',
        'קבל $5 credit חינם',
        'צור API Key חדש',
        'הדבק כאן'
      ]
    },
    {
      id: 'ollama',
      name: 'Ollama (חינמי מקומי)',
      key: 'ollamaEndpoint',
      url: 'https://ollama.ai',
      description: '🆓 הרץ מודלים מקומיים - אפס עלויות ללא קרדיטים',
      free: 'חינמי ב-100%',
      models: 'Llama 2, Mistral, Neural Chat וכו\'',
      category: 'free',
      steps: [
        'הורד Ollama מ-ollama.ai',
        'התקן וקבל את המודלים',
        'הרץ: ollama serve',
        'הוסף localhost:11434'
      ]
    },
    {
      id: 'localaib',
      name: 'LocalAI (חינמי מקומי)',
      key: 'localaiBudget',
      url: 'https://localai.io',
      description: '🆓 OpenAI-compatible API מקומי - אפס עלויות',
      free: 'חינמי ב-100%',
      models: 'מאות מודלים פתוחים',
      category: 'free',
      steps: [
        'התקן LocalAI',
        'הרץ: docker run -p 8080:8080 localai/localai',
        'כנס מודלים מרצוי',
        'הוסף http://localhost:8080'
      ]
    }
  ];

  const freeModels = apiProviders.filter(p => p.category === 'free');
  const paidModels = apiProviders.filter(p => p.category !== 'free');

  const updateSettings = useMutation({
    mutationFn: (data) => base44.entities.Settings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      toast.success('ההגדרות נשמרו בהצלחה! ✅');
    },
    onError: () => toast.error('שגיאה בשמירת ההגדרות'),
  });

  const handleSave = () => updateSettings.mutate(formData);
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const toggleKeyVisibility = (key) => setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }));

  const handleExportAll = async () => {
    try {
      const user = await getCurrentUser();
      const tools = await base44.entities.AiTool.filter({ created_by: user.email });
      const conversations = await base44.entities.Conversation.filter({ created_by: user.email });
      const exportData = { tools, conversations, settings: formData, exportDate: new Date().toISOString() };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-tools-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('גיבוי מלא יוצא בהצלחה! 💾');
    } catch (error) {
      toast.error('שגיאה בייצוא הנתונים');
    }
  };

  const handleResetAll = async () => {
    try {
      const user = await getCurrentUser();
      const tools = await base44.entities.AiTool.filter({ created_by: user.email });
      for (const tool of tools) await base44.entities.AiTool.delete(tool.id);
      const conversations = await base44.entities.Conversation.filter({ created_by: user.email });
      for (const conv of conversations) await base44.entities.Conversation.delete(conv.id);
      queryClient.invalidateQueries();
      toast.success('כל הנתונים נמחקו בהצלחה');
      setShowResetDialog(false);
    } catch (error) {
      toast.error('שגיאה באיפוס הנתונים');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">הגדרות</h1>
        <p className="text-gray-600 dark:text-gray-400">התאם את המערכת לצרכים שלך</p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11 gap-1 overflow-x-auto">
          <TabsTrigger value="branding">🎨</TabsTrigger>
          <TabsTrigger value="footer">🔗</TabsTrigger>
          <TabsTrigger value="api">🔑</TabsTrigger>
          <TabsTrigger value="ollama">🆓</TabsTrigger>
          <TabsTrigger value="preferences">⚙️</TabsTrigger>
          <TabsTrigger value="security">🔐</TabsTrigger>
          <TabsTrigger value="data">💾</TabsTrigger>
          <TabsTrigger value="language">🌐</TabsTrigger>
          <TabsTrigger value="collab">👥</TabsTrigger>
          <TabsTrigger value="calendar">📅</TabsTrigger>
          <TabsTrigger value="analytics">📊</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <BrandingTab settings={settings} />
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <FooterSettingsTab settings={settings} />
        </TabsContent>

        <TabsContent value="api" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                בחר מודל ברירת מחדל
              </h3>
              <Select value={formData.preferredModel} onValueChange={(val) => handleChange('preferredModel', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="font-semibold px-2 py-1 text-green-600 text-xs">🆓 חינמיים (מומלץ לחיסכון)</div>
                  {freeModels.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                  <div className="font-semibold px-2 py-1 text-orange-600 text-xs mt-2">💳 בתשלום</div>
                  {paidModels.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Coins className="w-5 h-5 text-green-600" />
                חיסכון קרדיטים
              </h3>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.useLocalModelsOnly}
                  onChange={(e) => handleChange('useLocalModelsOnly', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">השתמש בכלים חינמיים בלבד</span>
              </label>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <p>✓ Ollama + LocalAI לא משתמשים בקרדיטים</p>
                <p>✓ רצו מקומית על המחשב שלך</p>
                <p>✓ חוסך עד 100$ בחודש</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-3">עקוב אחרי עלויות</h3>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.trackApiCosts}
                  onChange={(e) => handleChange('trackApiCosts', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">עקוב אחרי עלויות API</span>
              </label>
              <div className="space-y-2">
                <Label className="text-xs">תקציב חודשי (₪)</Label>
                <Input
                  type="number"
                  value={formData.monthlyApibudget}
                  onChange={(e) => handleChange('monthlyApibudget', parseFloat(e.target.value))}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold text-lg mb-3 text-green-700 dark:text-green-400">🆓 כלים חינמיים (מומלץ!)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freeModels.map((provider) => {
                  const hasConfig = !!formData[provider.key];
                  return (
                    <Card key={provider.id} className="border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-green-700">
                              {provider.name}
                              {hasConfig && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </CardTitle>
                            <CardDescription>{provider.description}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(provider.url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>{provider.id === 'ollama' ? 'Ollama URL' : 'LocalAI URL'}</Label>
                          <Input
                            type="text"
                            value={formData[provider.key]}
                            onChange={(e) => handleChange(provider.key, e.target.value)}
                            placeholder={provider.key === 'ollamaEndpoint' ? 'http://localhost:11434' : 'http://localhost:8080'}
                          />
                        </div>
                        <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                          <p>💚 {provider.free}</p>
                          <p>🤖 {provider.models}</p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-sm font-semibold mb-2">📋 הוראות:</p>
                          <ol className="text-xs space-y-1 mr-4 list-decimal">
                            {provider.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-3 text-orange-700 dark:text-orange-400">💳 ספקי API בתשלום</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paidModels.map((provider) => {
                  const hasKey = !!formData[provider.key];
                  return (
                    <Card key={provider.id} className={hasKey ? 'border-blue-500' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {provider.name}
                              {hasKey && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </CardTitle>
                            <CardDescription>{provider.description}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(provider.url, '_blank')}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>מפתח API</Label>
                          <div className="flex gap-2">
                            <Input
                              type={visibleKeys[provider.key] ? 'text' : 'password'}
                              value={formData[provider.key]}
                              onChange={(e) => handleChange(provider.key, e.target.value)}
                              placeholder={`הדבק ${provider.name} API key...`}
                              className="flex-1"
                            />
                            <Button variant="outline" onClick={() => toggleKeyVisibility(provider.key)}>
                              {visibleKeys[provider.key] ? '🙈' : '👁️'}
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                          <p>💚 {provider.free}</p>
                          <p>🤖 {provider.models}</p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-sm font-semibold mb-2">📋 הוראות:</p>
                          <ol className="text-xs space-y-1 mr-4 list-decimal">
                            {provider.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-6 mt-6">
          <OllamaIntegration
            endpoint={formData.ollamaEndpoint}
            onEndpointChange={(url) => handleChange('ollamaEndpoint', url)}
            onModelSelect={(model) => handleChange('preferredModel', 'ollama')}
            selectedModel={formData.preferredModel === 'ollama' ? formData.ollamaEndpoint : null}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <div className="glass-effect rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold">העדפות ממשק</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>ערכת נושא</Label>
                <Select value={formData.theme} onValueChange={(val) => handleChange('theme', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">בהיר</SelectItem>
                    <SelectItem value="dark">כהה</SelectItem>
                    <SelectItem value="auto">אוטומטי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>תצוגת כלים</Label>
                <Select value={formData.viewMode} onValueChange={(val) => handleChange('viewMode', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">רשת</SelectItem>
                    <SelectItem value="list">רשימה</SelectItem>
                    <SelectItem value="compact">צפוף</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>מיון ברירת מחדל</Label>
                <Select value={formData.sortBy} onValueChange={(val) => handleChange('sortBy', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">עדכון אחרון</SelectItem>
                    <SelectItem value="created">תאריך יצירה</SelectItem>
                    <SelectItem value="name">שם (א-ת)</SelectItem>
                    <SelectItem value="rating">דירוג גבוה</SelectItem>
                    <SelectItem value="popularity">פופולריות</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>התראות</Label>
                  <Switch checked={formData.enableNotifications} onCheckedChange={(val) => handleChange('enableNotifications', val)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>קיצורי מקלדת</Label>
                  <Switch checked={formData.enableKeyboardShortcuts} onCheckedChange={(val) => handleChange('enableKeyboardShortcuts', val)} />
                </div>
              </div>
            </div>
          </div>

          {formData.enableKeyboardShortcuts && (
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">קיצורי מקלדת</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'כלי AI', key: 'Alt + 1' },
                  { label: 'עוזר AI', key: 'Alt + 2' },
                  { label: 'סטטיסטיקות', key: 'Alt + 3' },
                  { label: 'הגדרות', key: 'Alt + 4' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm">{item.label}</span>
                    <kbd className="px-3 py-1 bg-white dark:bg-gray-700 rounded border text-xs">{item.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">🔐 אבטחה וגישה</h3>
            <div className="space-y-4 max-w-xl">
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 p-4">
                <p className="font-semibold mb-1">המערכת משתמשת בהתחברות המובנית של Base44</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  אין סיסמה מקומית לניהול כאן — הגישה מנוהלת דרך חשבון המשתמש שלך.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => onLogout?.()}
                className="w-full text-red-600"
              >
                התנתק מהמערכת
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 mt-6">
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">ניהול נתונים</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExportAll} className="h-auto py-4 flex-col gap-2">
                <Download className="w-5 h-5" />
                <div><div className="font-medium">ייצא גיבוי מלא</div><div className="text-xs text-gray-500">כולל כלים, שיחות והגדרות</div></div>
              </Button>
              <Button variant="outline" onClick={() => setShowResetDialog(true)} className="h-auto py-4 flex-col gap-2 border-red-300 text-red-600">
                <Trash2 className="w-5 h-5" />
                <div><div className="font-medium">איפוס מלא</div><div className="text-xs">מחיקת כל הנתונים</div></div>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="language" className="space-y-6 mt-6">
          <div className="glass-effect rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">🌐 בחר שפה</h3>
            <LanguageSwitcher />
          </div>
        </TabsContent>

        <TabsContent value="collab" className="space-y-6 mt-6">
          <CollaborationPanel />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6 mt-6">
          <GoogleCalendarSync />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8">
          <Save className="w-5 h-5 ml-2" />
          שמור הגדרות
        </Button>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ אזהרה: איפוס מלא</AlertDialogTitle>
            <AlertDialogDescription>פעולה זו תמחק לצמיתות את כל הנתונים. לא ניתן לבטל!</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-red-600"><Trash2 className="w-4 h-4 ml-2" />כן, אפס הכל</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}