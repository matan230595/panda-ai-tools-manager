import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Plus, X, Calendar, AlertCircle, Check, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, addDays, isBefore, isToday } from 'date-fns';
import { he } from 'date-fns/locale';

export default function RemindersTab() {
  const queryClient = useQueryClient();
  const [autoReminders, setAutoReminders] = useState(true);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.Subscription.list(),
  });

  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.AiTool.list(),
  });

  const reminders = React.useMemo(() => {
    const result = [];

    // תזכורות חידוש מנוי
    subscriptions.forEach(sub => {
      if (!sub.renewalDate || !sub.isActive) return;
      
      const renewalDate = new Date(sub.renewalDate);
      const daysUntil = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 7 && daysUntil >= 0) {
        result.push({
          id: `renewal-${sub.id}`,
          type: 'renewal',
          title: `חידוש מנוי: ${sub.toolName}`,
          description: `המנוי מתחדש בעוד ${daysUntil} ימים`,
          date: renewalDate,
          priority: daysUntil <= 1 ? 'high' : daysUntil <= 3 ? 'medium' : 'low',
          tool: sub.toolName
        });
      }
    });

    // תזכורות לכלים שלא בשימוש
    tools.forEach(tool => {
      if (!tool.lastUsed || !tool.hasSubscription) return;
      
      const lastUsedDate = new Date(tool.lastUsed);
      const daysSinceUse = Math.floor((Date.now() - lastUsedDate) / (1000 * 60 * 60 * 24));

      if (daysSinceUse >= 30) {
        result.push({
          id: `unused-${tool.id}`,
          type: 'unused',
          title: `כלי לא בשימוש: ${tool.name}`,
          description: `לא השתמשת ב-${daysSinceUse} ימים - שקול לבטל מנוי`,
          date: addDays(lastUsedDate, 30),
          priority: daysSinceUse >= 60 ? 'high' : 'medium',
          tool: tool.name
        });
      }
    });

    // מיון לפי עדיפות ותאריך
    return result.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.date - b.date;
    });
  }, [subscriptions, tools]);

  const dismissReminder = (reminderId) => {
    // TODO: שמור dismissed reminders ב-localStorage או DB
    toast.success('התזכורת הוסרה');
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  };

  const typeIcons = {
    renewal: Calendar,
    unused: AlertCircle
  };

  useEffect(() => {
    // בדיקת תזכורות כל דקה
    const interval = setInterval(() => {
      reminders.forEach(reminder => {
        if (isToday(reminder.date) && reminder.priority === 'high') {
          toast.warning(reminder.title, {
            description: reminder.description,
            duration: 10000
          });
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            תזכורות אוטומטיות
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            אל תפספס חידושי מנויים וכלים שלא בשימוש
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="auto-reminders">תזכורות אוטומטיות</Label>
          <Switch
            id="auto-reminders"
            checked={autoReminders}
            onCheckedChange={setAutoReminders}
          />
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              תזכורות פעילות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {reminders.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              חידושים השבוע
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {reminders.filter(r => r.type === 'renewal').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              דחוף
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {reminders.filter(r => r.priority === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              כלים לא בשימוש
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {reminders.filter(r => r.type === 'unused').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* רשימת תזכורות */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Check className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">מעולה!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                אין תזכורות פעילות כרגע
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map(reminder => {
            const Icon = typeIcons[reminder.type];
            return (
              <Card key={reminder.id} className={`border-r-4 ${
                reminder.priority === 'high' ? 'border-r-red-500' :
                reminder.priority === 'medium' ? 'border-r-orange-500' :
                'border-r-blue-500'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        reminder.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                        reminder.priority === 'medium' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        'bg-blue-100 dark:bg-blue-900/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          reminder.priority === 'high' ? 'text-red-600' :
                          reminder.priority === 'medium' ? 'text-orange-600' :
                          'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{reminder.title}</CardTitle>
                        <CardDescription>{reminder.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge className={priorityColors[reminder.priority]}>
                            {reminder.priority === 'high' ? 'דחוף' : 
                             reminder.priority === 'medium' ? 'בינוני' : 'נמוך'}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="w-3 h-3 ml-1" />
                            {format(reminder.date, 'dd/MM/yyyy', { locale: he })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissReminder(reminder.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>

      {/* הגדרות תזכורות */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות תזכורות</CardTitle>
          <CardDescription>התאם אישית את התזכורות שלך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="renewal-7">תזכורת 7 ימים לפני חידוש</Label>
              <p className="text-sm text-gray-500">קבל התראה שבוע לפני</p>
            </div>
            <Switch id="renewal-7" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="renewal-1">תזכורת יום לפני חידוש</Label>
              <p className="text-sm text-gray-500">התראה ביום האחרון</p>
            </div>
            <Switch id="renewal-1" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="unused-30">תזכורת כלים שלא בשימוש (30 ימים)</Label>
              <p className="text-sm text-gray-500">התראה על מנויים שלא נגעת בהם</p>
            </div>
            <Switch id="unused-30" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}