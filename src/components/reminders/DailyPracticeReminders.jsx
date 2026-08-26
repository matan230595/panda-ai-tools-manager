import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Bell, Calendar, CheckCircle2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const MASTERY_ORDER = { 'מומחה': 3, 'בינוני': 2, 'מתחיל': 1 };

export default function DailyPracticeReminders({ isCalendarConnected }) {
  const queryClient = useQueryClient();
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [practiceTime, setPracticeTime] = useState('09:00');
  const { data: tools = [] } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => base44.entities.AiTool.filter({ created_by_id: (await getCurrentUser()).id }),
  });

  const practiceTools = tools.filter((tool) => (tool.masteryLevel || 'מתחיל') !== 'מומחה')
    .sort((a, b) => (MASTERY_ORDER[a.masteryLevel] || 1) - (MASTERY_ORDER[b.masteryLevel] || 1));

  const createPractice = useMutation({
    mutationFn: async () => {
      if (!isCalendarConnected) throw new Error('יש לחבר תחילה את היומן האישי');
      const today = new Date().toISOString().split('T')[0];
      const user = await getCurrentUser();
      const events = await Promise.all([...selectedTools].map(async (toolId) => {
        const tool = tools.find((item) => item.id === toolId);
        const reminder = await base44.entities.Reminder.create({
          toolId: tool.id, toolName: tool.name, reminderType: 'usage_check', reminderDate: today,
          reminderTime: practiceTime, message: `זמן תרגול קבוע: ${tool.name}`,
          priority: tool.learningPriority === 'דוחף' ? 'high' : 'medium', isActive: true,
          isCompleted: false, recipientEmail: user.email,
        });
        return {
          idPrefix: 'prac', sourceId: reminder.id, title: `תרגול: ${tool.name}`,
          description: `זמן תרגול קבוע עבור ${tool.name}`,
          startTime: `${today}T${practiceTime}:00`, endTime: `${today}T${practiceTime}:30`,
          recurrence: ['RRULE:FREQ=DAILY'],
          reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
        };
      }));
      return base44.functions.invoke('syncGoogleCalendar', { events });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-page-reminders'] });
      toast.success(`${response.data.synced} זמני תרגול יומיים נוספו ליומן`);
      setSelectedTools(new Set());
    },
    onError: (error) => toast.error(error.message || 'לא ניתן ליצור זמני תרגול'),
  });

  const toggle = (toolId) => setSelectedTools((current) => {
    const next = new Set(current);
    next.has(toolId) ? next.delete(toolId) : next.add(toolId);
    return next;
  });

  return (
    <section className="rounded-2xl border border-cyan-400/15 bg-[#1a202d]/60 p-4" dir="rtl">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
        <div><h2 className="font-semibold text-white">תרגול קבוע</h2><p className="mt-1 text-xs text-slate-400">בחר כלים, שעה קבועה וקבל התראה ביומן בכל יום.</p></div>
      </div>
      <label className="mt-4 block text-xs font-medium text-slate-300" htmlFor="practice-time">שעת תרגול יומית</label>
      <Input id="practice-time" type="time" value={practiceTime} onChange={(event) => setPracticeTime(event.target.value)} className="mt-1 w-full" />
      <div className="mt-3 max-h-56 space-y-2 overflow-y-auto">
        {practiceTools.map((tool) => (
          <button key={tool.id} type="button" onClick={() => toggle(tool.id)} aria-pressed={selectedTools.has(tool.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-right ${selectedTools.has(tool.id) ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-white/10 bg-white/[0.02]'}`}>
            <CheckCircle2 className={`h-5 w-5 shrink-0 ${selectedTools.has(tool.id) ? 'text-cyan-300' : 'text-slate-600'}`} />
            <span className="min-w-0 flex-1 truncate font-medium text-white" dir="ltr">{tool.name}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{tool.masteryLevel || 'מתחיל'}</span>
          </button>
        ))}
      </div>
      <button type="button" disabled={!selectedTools.size || createPractice.isPending || !isCalendarConnected} onClick={() => createPractice.mutate()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white disabled:opacity-40" aria-label="יצירת תזכורות תרגול יומיות ביומן">
        {createPractice.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
        צור תרגול יומי ביומן
      </button>
    </section>
  );
}