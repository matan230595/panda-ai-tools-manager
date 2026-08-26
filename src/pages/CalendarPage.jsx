import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import ReminderCalendarView from '@/components/calendar/ReminderCalendarView';
import GoogleCalendarSync from '@/components/GoogleCalendarSync';
import PersonalCalendarConnection from '@/components/calendar/PersonalCalendarConnection';
import PersonalGoogleTasksConnection from '@/components/calendar/PersonalGoogleTasksConnection';
import DailyPracticeReminders from '@/components/reminders/DailyPracticeReminders';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);

  const { data: reminders = [] } = useQuery({
    queryKey: ['calendar-page-reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({ created_by_id: user.id }, '-updated_date');
    },
    initialData: [],
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['calendar-page-subscriptions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Subscription.filter({ created_by_id: user.id }, '-updated_date');
    },
    initialData: [],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['calendar-page-tasks'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolTask.filter({ created_by_id: user.id }, '-updated_date');
    },
    initialData: [],
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['calendar-page-plans'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.ToolLearningPlan.filter({ created_by_id: user.id }, '-updated_date');
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
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 p-4 sm:p-6 shadow-xl shadow-pink-500/20">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative space-y-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">לוח שנה מאוחד</h1>
            <p className="text-xs sm:text-sm text-pink-100/90">כל התזכורות, חידושי מנויים, משימות ותוכניות למידה במקום אחד — עם צבעים להפרדה, גרירה ועדכון מהיר.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.8fr] gap-6 items-start">
          <div className="order-2 xl:order-1">
            <ReminderCalendarView
              reminders={reminders}
              subscriptions={subscriptions}
              tasks={tasks}
              plans={plans}
              onMoveReminder={(id, date) => moveReminderMutation.mutate({ id, date })}
              onMoveTask={(id, date) => moveTaskMutation.mutate({ id, date })}
            />
          </div>
          <div className="order-1 space-y-4 xl:order-2">
            <PersonalCalendarConnection onConnectionChange={setIsCalendarConnected} />
            <PersonalGoogleTasksConnection />
            <DailyPracticeReminders isCalendarConnected={isCalendarConnected} />
            <GoogleCalendarSync />
          </div>
        </div>
      </div>
    </div>
  );
}