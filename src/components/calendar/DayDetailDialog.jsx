import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Bell, CreditCard, ListChecks } from 'lucide-react';

const typeConfig = {
  subscription: { label: 'חידוש מנוי', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900' },
  task: { label: 'משימה', icon: ListChecks, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900' },
  reminder: { label: 'תזכורת', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' },
};

export default function DayDetailDialog({ open, onOpenChange, dateKey, items = [] }) {
  const formattedDate = dateKey
    ? new Date(dateKey).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 justify-start">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">אין פריטים ביום הזה.</div>
        ) : (
          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pt-2">
            {items.map((item) => {
              const config = typeConfig[item.itemType] || typeConfig.reminder;
              const Icon = config.icon;
              const title = item.itemType === 'task' ? item.title : item.toolName;
              const subtitle = item.itemType === 'subscription'
                ? `מנוי ${item.subscriptionType || ''} • תשלום/חידוש`
                : item.itemType === 'task'
                  ? `${item.description || 'משימה מקושרת לכלי'} • ${item.reminderTime || '09:00'}`
                  : `${item.message || ''} • ${item.reminderTime || '09:00'}`;

              return (
                <div key={`${item.itemType}-${item.id}`} className={`flex items-start gap-3 rounded-xl border p-3 ${config.bg}`}>
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0 text-right">
                    <div className="font-semibold text-sm truncate">{title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</div>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">{config.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}