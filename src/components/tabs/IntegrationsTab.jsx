import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { 
  Link as LinkIcon, 
  Zap, 
  Mail, 
  MessageSquare, 
  Calendar, 
  FileText,
  Check,
  X,
  Settings,
  Plus,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'חבר את הכלים שלך ל-5000+ אפליקציות',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    category: 'automation',
    setupUrl: 'https://zapier.com',
    features: ['אוטומציות מתקדמות', 'טריגרים מותאמים', 'פילטרים']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'קבל התראות וניהול דרך Slack',
    icon: MessageSquare,
    color: 'from-purple-500 to-pink-500',
    category: 'communication',
    setupUrl: 'https://slack.com',
    features: ['התראות בזמן אמת', 'פקודות slash', 'בוטים מותאמים']
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'שלח דיווחים אוטומטיים למייל',
    icon: Mail,
    color: 'from-red-500 to-pink-500',
    category: 'communication',
    setupUrl: 'https://gmail.com',
    features: ['דיווחים שבועיים', 'התראות', 'סיכומים חודשיים']
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'סנכרון תאריכי חידוש מנויים',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    category: 'productivity',
    setupUrl: 'https://calendar.google.com',
    features: ['תזכורות אוטומטיות', 'סנכרון דו-כיווני', 'אירועים משותפים']
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'ייצא את הכלים למסד הנתונים שלך',
    icon: FileText,
    color: 'from-gray-700 to-gray-900',
    category: 'productivity',
    setupUrl: 'https://notion.so',
    features: ['סנכרון אוטומטי', 'תבניות מותאמות', 'דו"חות']
  },
  {
    id: 'webhook',
    name: 'Webhook מותאם',
    description: 'התאם אישית אינטגרציות משלך',
    icon: LinkIcon,
    color: 'from-indigo-500 to-purple-500',
    category: 'custom',
    features: ['אירועים בהתאמה אישית', 'Payload מותאם', 'אבטחה מלאה']
  },
];

export default function IntegrationsTab() {
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configuring, setConfiguring] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState([]);

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Integration.filter({ created_by: user.email });
    },
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by: user.email });
    },
  });

  const monthlyExpenses = useMemo(() => subscriptions.filter(item => item.isActive), [subscriptions]);
  const monthlyTotal = monthlyExpenses.reduce((sum, item) => sum + (item.priceMonthly || 0), 0);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Integration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('האינטגרציה הופעלה בהצלחה! 🎉');
      setConfiguring(null);
      setWebhookUrl('');
      setWebhookEvents([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Integration.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('האינטגרציה עודכנה בהצלחה! ✅');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Integration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('האינטגרציה הוסרה');
    },
  });

  const handleToggleIntegration = (integration) => {
    const existing = integrations.find(i => i.name === integration.name);
    
    if (existing) {
      updateMutation.mutate({
        id: existing.id,
        data: { ...existing, isEnabled: !existing.isEnabled }
      });
    } else {
      setConfiguring(integration);
    }
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl) {
      toast.error('הזן URL של Webhook');
      return;
    }

    createMutation.mutate({
      name: 'Webhook מותאם',
      category: 'webhook',
      isEnabled: true,
      config: {
        url: webhookUrl,
        events: webhookEvents
      },
      description: 'Webhook מותאם אישית'
    });
  };

  const isIntegrationActive = (integrationName) => {
    return integrations.some(i => i.name === integrationName && i.isEnabled);
  };

  const exportMonthlyReportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Monthly AI Expenses Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 14, 28);
    doc.text(`Total Monthly Cost: ILS ${monthlyTotal.toFixed(0)}`, 14, 36);

    let y = 50;
    monthlyExpenses.forEach((item) => {
      doc.text(`${item.toolName} - ILS ${item.priceMonthly || 0} - ${item.subscriptionType}`, 14, y);
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`monthly-expenses-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('דוח PDF יוצא בהצלחה');
  };

  const exportMonthlyReportCSV = () => {
    const headers = ['Tool Name', 'Subscription Type', 'Monthly Cost', 'Renewal Date'];
    const rows = monthlyExpenses.map((item) => [item.toolName, item.subscriptionType, item.priceMonthly || 0, item.renewalDate || '']);
    const csv = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `monthly-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('דוח Excel/CSV יוצא בהצלחה');
  };

  const categories = [
    { id: 'automation', label: 'אוטומציה', icon: Zap },
    { id: 'communication', label: 'תקשורת', icon: MessageSquare },
    { id: 'productivity', label: 'פרודוקטיביות', icon: Calendar },
    { id: 'custom', label: 'מותאם אישית', icon: LinkIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
          אינטגרציות מתקדמות
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          חבר את המערכת לכלים האהובים עליך
        </p>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              אינטגרציות פעילות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {integrations.filter(i => i.isEnabled).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              זמינות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">
              {AVAILABLE_INTEGRATIONS.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              מותאמות אישית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {integrations.filter(i => i.category === 'webhook').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">דוחות הוצאות</CardTitle>
            <CardDescription>ייצוא חודשי מדויק עם הסבר קצר לכל קובץ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-500">סה״כ עלות חודשית נוכחית: ₪{monthlyTotal.toFixed(0)}</div>
            <Button className="w-full" onClick={exportMonthlyReportPDF}>ייצוא PDF</Button>
            <Button className="w-full" variant="outline" onClick={exportMonthlyReportCSV}>ייצוא Excel / CSV</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">משיכת עלויות אוטומטית</CardTitle>
            <CardDescription>Stripe / חשבוניות / שירותי סליקה.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge variant="outline">מוכן לחיבור API</Badge>
            <p className="text-gray-500">החיבור האוטומטי דורש מפתח API או חיבור שירות חיצוני, ולכן כרגע המצב הוא ידני עם ייצוא מלא.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">גיבוי ענן</CardTitle>
            <CardDescription>Google Drive לגיבוי JSON יומי.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Badge className="bg-amber-100 text-amber-800">ממתין לאישור Drive</Badge>
            <p className="text-gray-500">הממשק הוכן ברמת האפליקציה, והשלב הבא הוא אישור Google Drive כדי לאפשר גיבוי אוטומטי.</p>
          </CardContent>
        </Card>
      </div>

      {/* אינטגרציות לפי קטגוריה */}
      {categories.map(category => {
        const categoryIntegrations = AVAILABLE_INTEGRATIONS.filter(
          i => i.category === category.id
        );

        if (categoryIntegrations.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <category.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold">{category.label}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map(integration => {
                const Icon = integration.icon;
                const isActive = isIntegrationActive(integration.name);

                return (
                  <Card key={integration.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${integration.color}`} />
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            {isActive && (
                              <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                <Check className="w-3 h-3 ml-1" />
                                פעיל
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">
                        {integration.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {integration.features && (
                        <ul className="space-y-1 text-sm">
                          {integration.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Check className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex gap-2">
                        {integration.setupUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(integration.setupUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 ml-2" />
                            למד עוד
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className={`flex-1 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}
                          onClick={() => handleToggleIntegration(integration)}
                        >
                          {isActive ? (
                            <>
                              <X className="w-4 h-4 ml-2" />
                              השבת
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 ml-2" />
                              הפעל
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* דיאלוג הגדרת Webhook */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הגדרת {configuring?.name}</DialogTitle>
            <DialogDescription>
              הזן את הפרטים להפעלת האינטגרציה
            </DialogDescription>
          </DialogHeader>

          {configuring?.id === 'webhook' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-webhook-url.com/endpoint"
                />
              </div>

              <div className="space-y-2">
                <Label>אירועים</Label>
                <div className="space-y-2">
                  {['tool_created', 'tool_updated', 'tool_deleted', 'subscription_renewed'].map(event => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents([...webhookEvents, event]);
                          } else {
                            setWebhookEvents(webhookEvents.filter(e => e !== event));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{event.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveWebhook} className="w-full">
                <Check className="w-4 h-4 ml-2" />
                שמור והפעל
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                האינטגרציה עם {configuring?.name} תופעל. תוכל להגדיר אותה דרך {configuring?.name}.
              </p>
              <Button 
                onClick={() => {
                  createMutation.mutate({
                    name: configuring.name,
                    category: configuring.category,
                    isEnabled: true,
                    description: configuring.description
                  });
                }}
                className="w-full"
              >
                <Check className="w-4 h-4 ml-2" />
                הפעל אינטגרציה
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}