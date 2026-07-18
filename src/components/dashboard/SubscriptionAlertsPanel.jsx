import React, { useMemo } from 'react';
import { AlertTriangle, BellRing, MailCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionAlertsPanel({ subscriptions = [], reminders = [] }) {
  const summary = useMemo(() => {
    const activeSubs = subscriptions.filter((item) => item.isActive && item.renewalDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const soon = activeSubs
      .map((item) => {
        const renewal = new Date(`${item.renewalDate}T00:00:00`);
        const daysLeft = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
        return { ...item, daysLeft };
      })
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 14)
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const openReminderCount = reminders.filter((item) => item.isActive && !item.isCompleted && item.reminderType === 'subscription_expiry').length;

    return {
      urgentToday: soon.filter((item) => item.daysLeft === 0),
      thisWeek: soon.filter((item) => item.daysLeft > 0 && item.daysLeft <= 7),
      soon,
      openReminderCount,
    };
  }, [subscriptions, reminders]);

  if (summary.soon.length === 0 && summary.openReminderCount === 0) return null;

  return (
    <Card className="p-5 md:p-6 border border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-900 dark:to-indigo-950/20">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2"><BellRing className="w-5 h-5 text-indigo-600" />מרכז התראות חידוש</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">תזכורות יומיות במערכת ומייל אוטומטי לפני חידוש מנוי.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-red-600">היום: {summary.urgentToday.length}</Badge>
          <Badge className="bg-orange-500">השבוע: {summary.thisWeek.length}</Badge>
          <Badge variant="outline" className="text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"><MailCheck className="w-3 h-3 ml-1" />מיילים פתוחים: {summary.openReminderCount}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {summary.soon.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{item.toolName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">חידוש: {new Date(item.renewalDate).toLocaleDateString('he-IL')}</div>
              </div>
              <Badge className={item.daysLeft === 0 ? 'bg-red-600' : item.daysLeft <= 7 ? 'bg-orange-500' : 'bg-blue-600'}>
                {item.daysLeft === 0 ? 'היום' : `${item.daysLeft} ימים`}
              </Badge>
            </div>
            <div className="text-sm mt-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {item.daysLeft === 0 ? 'כדאי להחליט היום אם לחדש או לבטל.' : 'מומלץ לבדוק בזמן אם להמשיך או לעצור.'}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}