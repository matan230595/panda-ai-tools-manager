import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Key, Palette, Download, Trash2, Save, AlertCircle, ExternalLink, CheckCircle, Zap, Coins, ChevronRight, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { API_PROVIDERS, FREE_MODELS, PAID_MODELS } from '@/lib/apiProviders';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import SettingsNav from '@/components/tabs/SettingsNav';
import OllamaIntegration from '@/components/integrations/OllamaIntegration';
import BrandingTab from '@/components/tabs/BrandingTab';
import FooterSettingsTab from '@/components/tabs/FooterSettingsTab';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import CollaborationPanel from '../CollaborationPanel.jsx';
import GoogleCalendarSync from '../GoogleCalendarSync.jsx';
import AdvancedAnalytics from '../analytics/AdvancedAnalytics.jsx';
import ApiKeyVaultPanel from '@/components/tools/ApiKeyVaultPanel';
import BackupRestore from '@/components/tools/BackupRestore';

export default function SettingsTab({ settings, onLogout }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
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
  const [mobileSection, setMobileSection] = useState('branding');
  const [providerConnectionStates, setProviderConnectionStates] = useState({});

  const apiProviders = API_PROVIDERS;
  const freeModels = FREE_MODELS;
  const paidModels = PAID_MODELS;

  const updateSettings = useMutation({
    mutationFn: (data) => base44.entities.Settings.update(settings.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('ההגדרות נשמרו בהצלחה! ✅');
    },
    onError: () => toast.error('שגיאה בשמירת ההגדרות'),
  });

  const handleSave = () => {
    const safeSettings = Object.fromEntries(
      Object.entries(formData).filter(([key]) => !key.toLowerCase().includes('apikey'))
    );
    updateSettings.mutate(safeSettings);
  };
  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const providerStatuses = useMemo(() => {
    const getValue = (key) => String(formData[key] || '').trim();
    return apiProviders.map((provider) => {
      const value = getValue(provider.key);
      const isConfigured = !!value;
      const isEndpoint = provider.key === 'ollamaEndpoint' || provider.key === 'localaiBudget';
      const looksValid = isEndpoint
        ? /^https?:\/\//.test(value)
        : value.length >= 12;
      const connectionState = providerConnectionStates[provider.id] || 'idle';
      const status = !isConfigured ? 'missing' : !looksValid ? 'invalid' : connectionState === 'connected' ? 'connected' : connectionState === 'failed' ? 'failed' : 'configured';

      return {
        ...provider,
        isConfigured,
        looksValid,
        connectionState,
        status
      };
    });
  }, [formData, providerConnectionStates]);

  const providerStatusMap = useMemo(() => {
    const map = {};
    providerStatuses.forEach((p) => { map[p.id] = p; });
    return map;
  }, [providerStatuses]);

  useEffect(() => {
    const nextStates = {};
    apiProviders.forEach((provider) => {
      const value = String(formData[provider.key] || '').trim();
      const isEndpoint = provider.key === 'ollamaEndpoint' || provider.key === 'localaiBudget';
      if (!value) {
        nextStates[provider.id] = 'idle';
      } else if (isEndpoint) {
        nextStates[provider.id] = /^https?:\/\//.test(value) ? 'connected' : 'failed';
      } else {
        nextStates[provider.id] = value.length >= 12 ? 'connected' : 'failed';
      }
    });
    setProviderConnectionStates(nextStates);
  }, [formData]);

  const settingsSections = [
    { id: 'branding', label: 'מיתוג' },
    { id: 'footer', label: 'פוטר' },
    { id: 'api', label: 'API' },
    { id: 'ollama', label: 'מקומי' },
    { id: 'preferences', label: 'ממשק' },
    { id: 'security', label: 'אבטחה' },
    { id: 'data', label: 'נתונים' },
    { id: 'language', label: 'שפה' },
    { id: 'collab', label: 'שיתוף' },
    { id: 'calendar', label: 'יומן' },
    { id: 'analytics', label: 'אנליטיקה' },
  ];

  const handleExportAll = async () => {
    try {
      const user = await getCurrentUser();
      const tools = await base44.entities.AiTool.filter({ created_by_id: user.id });
      const conversations = await base44.entities.Conversation.filter({ created_by_id: user.id });
      const safeTools = tools.map(({ userCredentials, ...tool }) => ({
        ...tool,
        userCredentials: userCredentials ? {
          email: userCredentials.email || '',
          username: userCredentials.username || '',
          phoneNumber: userCredentials.phoneNumber || '',
          googleConnected: !!userCredentials.googleConnected,
        } : undefined,
      }));
      const safeSettings = Object.fromEntries(
        Object.entries(formData).filter(([key]) => !key.toLowerCase().includes('apikey'))
      );
      const exportData = { tools: safeTools, conversations, settings: safeSettings, exportDate: new Date().toISOString() };
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
      await base44.entities.AiTool.deleteMany({ created_by_id: user.id });
      await base44.entities.Conversation.deleteMany({ created_by_id: user.id });
      queryClient.invalidateQueries();
      toast.success('כל הנתונים נמחקו בהצלחה');
      setShowResetDialog(false);
    } catch (error) {
      toast.error('שגיאה באיפוס הנתונים');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative text-right">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-0.5">הגדרות</h1>
          <p className="text-xs sm:text-sm text-indigo-100/90">התאם את המערכת לצרכים שלך</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-56 lg:w-64 flex-shrink-0 md:sticky md:top-4">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2">
            <SettingsNav sections={settingsSections} active={mobileSection} onChange={setMobileSection} />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <Tabs value={mobileSection} onValueChange={setMobileSection} className="w-full">
        <TabsContent value="branding" className="mt-0">
          <BrandingTab settings={settings} />
        </TabsContent>

        <TabsContent value="footer" className="mt-6">
          <FooterSettingsTab settings={settings} />
        </TabsContent>

        <TabsContent value="api" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="glass-effect rounded-2xl p-6 lg:col-span-3">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                מצב מפתחות וחיבורים
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {providerStatuses.map((provider) => (
                  <div key={provider.id} className="rounded-xl border p-3 bg-white/70 dark:bg-gray-900/40">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">{provider.name}</div>
                      {provider.status === 'connected' ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-4 h-4" /> מפתח שמור</span>
                      ) : provider.status === 'configured' ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 text-xs"><Activity className="w-4 h-4" /> מוגדר</span>
                      ) : provider.status === 'failed' || provider.status === 'invalid' ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs"><AlertCircle className="w-4 h-4" /> שגוי</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-xs"><XCircle className="w-4 h-4" /> חסר</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {provider.status === 'connected'
                        ? 'המפתח נשמר ונראה תקין בפורמט. אימות מול הספק יתבצע בזמן שימוש בפועל.'
                        : provider.status === 'configured'
                          ? 'המפתח שמור ונראה תקין.'
                          : provider.status === 'failed' || provider.status === 'invalid'
                            ? 'הערך שמור אבל הפורמט לא נראה תקין.'
                            : 'עדיין לא הוגדר.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                          <p className={providerStatusMap[provider.id]?.status === 'connected' ? 'text-green-600' : providerStatusMap[provider.id]?.status === 'failed' || providerStatusMap[provider.id]?.status === 'invalid' ? 'text-amber-600' : 'text-gray-500'}>
                            {providerStatusMap[provider.id]?.status === 'connected'
                              ? '✓ הכתובת תקינה וזמינה'
                              : providerStatusMap[provider.id]?.status === 'failed' || providerStatusMap[provider.id]?.status === 'invalid'
                                ? '⚠ בדוק את הכתובת'
                                : '— לא הוגדר עדיין'}
                          </p>
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
                          <Label>מפתח API — מנוהל מחוץ למערכת</Label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 space-y-2">
                              <Input
                                type="password"
                                value=""
                                disabled
                                placeholder="מטעמי אבטחה, מפתחות אינם נשמרים כאן"
                                className="flex-1"
                              />
                              <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${providerStatusMap[provider.id]?.status === 'connected' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' : providerStatusMap[provider.id]?.status === 'configured' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : providerStatusMap[provider.id]?.status === 'failed' || providerStatusMap[provider.id]?.status === 'invalid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                {providerStatusMap[provider.id]?.status === 'connected' ? <CheckCircle2 className="w-3.5 h-3.5" /> : providerStatusMap[provider.id]?.status === 'configured' ? <Activity className="w-3.5 h-3.5" /> : providerStatusMap[provider.id]?.status === 'failed' || providerStatusMap[provider.id]?.status === 'invalid' ? <AlertCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                <span>{providerStatusMap[provider.id]?.status === 'connected' ? 'מפתח שמור' : providerStatusMap[provider.id]?.status === 'configured' ? 'מוגדר' : providerStatusMap[provider.id]?.status === 'failed' || providerStatusMap[provider.id]?.status === 'invalid' ? 'צריך תיקון' : 'לא הוגדר'}</span>
                              </div>
                            </div>
                            <span className="inline-flex min-h-[44px] items-center rounded-md border px-3 text-xs text-gray-500">לא נשמר במערכת</span>
                          </div>
                        </div>
                        <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                          <p>💚 {provider.free}</p>
                          <p>🤖 {provider.models}</p>
                          <p className={providerStatusMap[provider.id]?.status === 'valid' ? 'text-green-600' : providerStatusMap[provider.id]?.status === 'invalid' ? 'text-amber-600' : 'text-gray-500'}>
                            {providerStatusMap[provider.id]?.status === 'valid'
                              ? '✓ המפתח נראה מוגדר'
                              : providerStatusMap[provider.id]?.status === 'invalid'
                                ? '⚠ המפתח קצר או לא שלם'
                                : '— לא הוגדר עדיין'}
                          </p>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card className="bg-[#1a202d]/60 backdrop-blur-xl border-cyan-400/15">
          <CardContent className="pt-4"><ApiKeyVaultPanel /></CardContent>
        </Card>
        <Card className="bg-[#1a202d]/60 backdrop-blur-xl border-cyan-400/15">
          <CardContent className="pt-4"><BackupRestore /></CardContent>
        </Card>
      </div>

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