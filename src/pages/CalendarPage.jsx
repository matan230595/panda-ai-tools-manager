import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import ReminderCalendarView from '@/components/calendar/ReminderCalendarView';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';

export default function CalendarPage() {
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['calendar-page-reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by: user.email }, '-updated_date');
    },
    initialData: [],
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['calendar-page-subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by: user.email }, '-updated_date');
    },
    initialData: [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['calendar-page-tasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by: user.email }, '-updated_date');
    },
    initialData: [],
  });

  const moveReminderMutation = useMutation({
    mutationFn: async ({ id, date }) => {
      const reminder = reminders.find((item) => item.id === id);
      return base44.entities.Reminder.update(id, { ...reminder, reminderDate: date });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-page-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: async ({ id, date }) => {
      const task = tasks.find((item) => item.id === id);
      return base44.entities.ToolTask.update(id, { ...task, dueDate: date });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-page-tasks'] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl font-bold gradient-text">לוח שנה לחידושי מנויים ותזכורות</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">צפייה בכל חידושי המנויים, תזכורות ומשימות במקום אחד עם גרירה ושחרור ועדכון מהיר.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6 items-start">
          <ReminderCalendarView
            reminders={reminders}
            subscriptions={subscriptions}
            tasks={tasks}
            onMoveReminder={(id, date) => moveReminderMutation.mutate({ id, date })}
            onMoveTask={(id, date) => moveTaskMutation.mutate({ id, date })}
          />
          <GoogleCalendarSync />
        </div>
      </div>
    </div>
  );
}