import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Bell, CreditCard, ListChecks, Plus, Pencil, Trash2, Loader2, GraduationCap, Flag } from 'lucide-react';
import { toast } from 'sonner';
import DayReminderForm from '@/components/calendar/DayReminderForm';

const typeConfig = {
  subscription: { label: 'חידוש מנוי', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900' },
  task: { label: 'משימה', icon: ListChecks, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900' },
  reminder: { label: 'תזכורת', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' },
  plan: { label: 'תוכנית למידה', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900' },
  step: { label: 'שלב למידה', icon: Flag, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' },
};

export default function DayDetailDialog({ open, onOpenChange, dateKey, items = [] }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingItem, setEditingItem] = useState(null);

  const formattedDate = dateKey
    ? new Date(dateKey).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['calendar-page-reminders'] });
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
    queryClient.invalidateQueries({ queryKey: ['calendar-reminders'] });
  };

  const resetToList = () => {
    setMode('list');
    setEditingItem(null);
  };

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      if (editingItem) {
        return base44.entities.Reminder.update(editingItem.id, {
          toolName: values.toolName,
          message: values.message,
          reminderTime: values.reminderTime,
          reminderDate: values.reminderDate,
        });
      }
      const user = await getCurrentUser();
      return base44.entities.Reminder.create({
        toolId: 'manual',
        toolName: values.toolName,
        reminderType: 'custom',
        reminderDate: values.reminderDate,
        reminderTime: values.reminderTime,
        message: values.message,
        recipientEmail: user.email,
        isActive: true,
        isCompleted: false,
        priority: 'medium',
      });
    },
    onSuccess: () => {
      refresh();
      toast.success(editingItem ? 'התזכורת עודכנה' : 'התזכורת נוספה');
      resetToList();
    },
    onError: (error) => toast.error(error.message || 'שגיאה בשמירה'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (item) => {
      const entityMap = { reminder: 'Reminder', task: 'ToolTask', subscription: 'Subscription' };
      const entityName = entityMap[item.itemType];
      if (!entityName) throw new Error('לא ניתן למחוק פריט מסוג זה מהיומן');
      return base44.entities[entityName].delete(item.id);
    },
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ['calendar-page-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-page-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-page-plans'] });
      toast.success('הפריט נמחק');
    },
    onError: (error) => toast.error(error.message || 'שגיאה במחיקה'),
  });

  const handleClose = (nextOpen) => {
    if (!nextOpen) resetToList();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 justify-start">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>

        {mode !== 'list' ? (
          <DayReminderForm
            dateKey={dateKey}
            initial={editingItem}
            isSaving={saveMutation.isPending}
            onSave={(values) => saveMutation.mutate(values)}
            onCancel={resetToList}
          />
        ) : (
          <>
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">אין פריטים ביום הזה.</div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pt-2">
                {items.map((item) => {
                  const config = typeConfig[item.itemType] || typeConfig.reminder;
                  const Icon = config.icon;
                  const title = item.itemType === 'task' || item.itemType === 'step' ? (item.title || item.planTitle) : item.itemType === 'plan' ? item.title : item.toolName;
                  const subtitle = item.itemType === 'subscription'
                    ? `מנוי ${item.subscriptionType || ''} • תשלום/חידוש`
                    : item.itemType === 'task'
                      ? `${item.description || 'משימה מקושרת לכלי'}${item.reminderTime ? ` • ${item.reminderTime}` : ''}`
                      : item.itemType === 'plan'
                        ? (item.description || 'תוכנית למידה')
                        : item.itemType === 'step'
                          ? (item.description || 'שלב למידה')
                          : `${item.message || ''}${item.reminderTime ? ` • ${item.reminderTime}` : ''}`;

                  return (
                    <div key={`${item.itemType}-${item.id}`} className={`flex items-start gap-3 rounded-xl border p-3 ${config.bg}`}>
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0 text-right">
                        <div className="font-semibold text-sm truncate">{title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{subtitle}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <Badge variant="outline">{config.label}</Badge>
                        <div className="flex gap-1">
                          {item.itemType === 'reminder' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => { setEditingItem(item); setMode('edit'); }}
                              title="ערוך"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {item.itemType !== 'plan' && item.itemType !== 'step' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 dark:text-red-400"
                              onClick={() => deleteMutation.mutate(item)}
                              disabled={deleteMutation.isPending}
                              title="מחק"
                            >
                              {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button className="w-full mt-2" onClick={() => { setEditingItem(null); setMode('add'); }}>
              <Plus className="w-4 h-4 ml-2" />
              הוסף תזכורת ליום זה
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}