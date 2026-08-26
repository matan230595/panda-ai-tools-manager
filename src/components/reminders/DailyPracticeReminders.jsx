import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Calendar, Loader2, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const MASTERY_ORDER = { 'מומחה': 3, 'בינוני': 2, 'מתחיל': 1 };

/**
 * יוצר תזכורות תרגול יומיות לכלים שנבחרו ומסנכרן אותן ליומן Google.
 */
export default function DailyPracticeReminders() {
  const queryClient = useQueryClient();
  const [selectedTools, setSelectedTools] = useState(new Set());

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.AiTool.filter({ created_by_id: user.id });
    },
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['practice-reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by_id: user.id, reminderType: 'usage_check' });
    },
  });

  // כלים שלא ברמת מומחה — מועמדים לתרגול
  const practiceTools = tools
    .filter(t => (t.masteryLevel || 'מתחיל') !== 'מומחה')
    .sort((a, b) => (MASTERY_ORDER[a.masteryLevel] || 1) - (MASTERY_ORDER[b.masteryLevel] || 1));

  const existingReminderToolIds = new Set(reminders.filter(r => !r.isCompleted).map(r => r.toolId));

  const toggleTool = (toolId) => {
    setSelectedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const createRemindersMutation = useMutation({
    mutationFn: async () => {
      const user = await getCurrentUser();
      const today = new Date();
      const events = [];
      const created = [];

      for (const toolId of selectedTools) {
        const tool = tools.find(t => t.id === toolId);
        if (!tool) continue;

        // תזכורת להיום
        const reminderDate = today.toISOString().split('T')[0];
        const reminderTime = '09:00';

        const reminder = await base44.entities.Reminder.create({
          toolId: tool.id,
          toolName: tool.name,
          reminderType: 'usage_check',
          reminderDate,
          reminderTime,
          message: `תרגל את ${tool.name} — רמה נוכחית: ${tool.masteryLevel || 'מתחיל'}`,
          priority: tool.learningPriority === 'דוחף' ? 'high' : tool.learningPriority === 'חשוב' ? 'medium' : 'low',
          isActive: true,
          isCompleted: false,
          recipientEmail: user.email,
        });
        created.push(reminder);

        events.push({
          idPrefix: 'prac',
          sourceId: reminder.id,
          title: `תרגול: ${tool.name}`,
          description: `תרגל את ${tool.name} — רמה נוכחית: ${tool.masteryLevel || 'מתחיל'}`,
          startTime: `${reminderDate}T${reminderTime}:00`,
          endTime: `${reminderDate}T${reminderTime}:30`,
        });
      }

      // סנכרון ליומן Google
      let syncResult = null;
      if (events.length > 0) {
        try {
          const res = await base44.functions.invoke('syncGoogleCalendar', { events });
          syncResult = res.data;
        } catch (e) {
          syncResult = { error: e.message };
        }
      }

      return { created: created.length, syncResult };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['practice-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reminders'] });
      const synced = data.syncResult?.synced ?? 0;
      const syncErr = data.syncResult?.error;
      if (syncErr) {
        toast.success(`נוצרו ${data.created} תזכורות תרגול, אך סנכרון היומן נכשל: ${syncErr}`);
      } else if (synced > 0) {
        toast.success(`נוצרו ${data.created} תזכורות תרגול וסונכרנו ליומן Google ✓`);
      } else {
        toast.success(`נוצרו ${data.created} תזכורות תרגול`);
      }
      setSelectedTools(new Set());
    },
    onError: (err) => toast.error(err.message || 'שגיאה ביצירת תזכורות'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (practiceTools.length === 0) {
    return (
      <div className="rounded-xl border border-cyan-400/15 bg-[#1a202d]/60 p-6 text-center">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
        <p className="text-sm text-slate-300">השליטה בכל הכלים שלך ברמת מומחה! 🎉</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold text-white">תזכורות תרגול יומיות ליומן</h3>
      </div>

      <p className="text-xs text-slate-400">
        בחר כלים לתרגול יומי. תזכורות ייווצרו ויסונכרנו ישירות ללוח השנה שלך ב-Google.
      </p>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {practiceTools.map(tool => {
          const isSelected = selectedTools.has(tool.id);
          const hasReminder = existingReminderToolIds.has(tool.id);
          return (
            <button
              key={tool.id}
              onClick={() => toggleTool(tool.id)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-right ${
                isSelected
                  ? 'border-cyan-400/50 bg-cyan-500/10'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
              }`}>
                {isSelected && <CheckCircle2 className="w-3 h-3 text-[#0b0d12]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{tool.name}</div>
                <div className="text-[10px] text-slate-400">{tool.category?.replace(/_/g, ' ')}</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                tool.masteryLevel === 'מומחה' ? 'bg-green-500/20 text-green-300' :
                tool.masteryLevel === 'בינוני' ? 'bg-amber-500/20 text-amber-300' :
                'bg-cyan-500/20 text-cyan-300'
              }`}>
                {tool.masteryLevel || 'מתחיל'}
              </span>
              {hasReminder && (
                <Bell className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {selectedTools.size > 0 && (
        <button
          onClick={() => createRemindersMutation.mutate()}
          disabled={createRemindersMutation.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 text-sm transition-all disabled:opacity-40"
        >
          {createRemindersMutation.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> יוצר ומסנכרן...</>
          ) : (
            <><Calendar className="w-4 h-4" /> צור {selectedTools.size} תזכורות וסנכרן ליומן</>
          )}
        </button>
      )}

      {existingReminderToolIds.size > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <AlertCircle className="w-3 h-3" />
          {existingReminderToolIds.size} כלים כבר מחכים לתרגול
        </div>
      )}
    </div>
  );
}