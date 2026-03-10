import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleCalendarSync() {
  const queryClient = useQueryClient();

  const { data: reminders = [] } = useQuery({
    queryKey: ['calendar-reminders'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Reminder.filter({
        created_by: user.email,
        isActive: true,
        isCompleted: false,
      });
    },
  });

  const { data: integrations = [] } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const user = await getCurrentUser();
      return base44.entities.Integration.filter({ created_by: user.email });
    },
  });

  const calendarIntegration = integrations.find((item) => item.name === 'Google Calendar');
  const isEnabled = !!calendarIntegration?.isEnabled;

  const enableSyncMutation = useMutation({
    mutationFn: async () => {
      if (calendarIntegration) {
        return base44.entities.Integration.update(calendarIntegration.id, {
          ...calendarIntegration,
          isEnabled: true,
        });
      }

      return base44.entities.Integration.create({
        name: 'Google Calendar',
        category: 'automation',
        isEnabled: true,
        description: 'סנכרון תזכורות ללוח השנה',
        config: {
          lastSyncedAt: null,
          lastSyncedCount: 0,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('סנכרון היומן הופעל');
    },
  });

  const syncRemindersMutation = useMutation({
    mutationFn: async () => {
      if (reminders.length === 0) {
        throw new Error('אין תזכורות פעילות לסנכרון');
      }

      const events = reminders.map((reminder) => ({
        title: `תזכורת: ${reminder.toolName}`,
        description: reminder.message,
        startTime: `${reminder.reminderDate}T${reminder.reminderTime || '09:00'}:00`,
        endTime: `${reminder.reminderDate}T${reminder.reminderTime || '09:00'}:30`,
      }));

      const response = await base44.functions.invoke('syncGoogleCalendar', { events });

      if (calendarIntegration) {
        await base44.entities.Integration.update(calendarIntegration.id, {
          ...calendarIntegration,
          isEnabled: true,
          config: {
            ...(calendarIntegration.config || {}),
            lastSyncedAt: new Date().toISOString(),
            lastSyncedCount: response.data.synced || 0,
          },
        });
      }

      return response;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['integrations']);
      toast.success(`סונכרנו ${res.data.synced} אירועים`);
    },
    onError: (error) => toast.error(error.message || 'שגיאה בסנכרון היומן'),
  });

  return (
    <Card className="border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          סנכרון מהיר של התזכורות הפעילות מהמערכת ליומן Google המחובר.
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-white/70 dark:bg-gray-900/50 p-3">
            <div className="text-gray-500">תזכורות פעילות</div>
            <div className="text-xl font-bold text-blue-600">{reminders.length}</div>
          </div>
          <div className="rounded-lg bg-white/70 dark:bg-gray-900/50 p-3">
            <div className="text-gray-500">סנכרון אחרון</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {calendarIntegration?.config?.lastSyncedAt
                ? new Date(calendarIntegration.config.lastSyncedAt).toLocaleString('he-IL')
                : 'עדיין לא בוצע'}
            </div>
          </div>
        </div>

        {!isEnabled ? (
          <Button
            onClick={() => enableSyncMutation.mutate()}
            disabled={enableSyncMutation.isPending}
            className="w-full"
          >
            {enableSyncMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מפעיל...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 ml-2" />
                הפעל סנכרון יומן
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => syncRemindersMutation.mutate()}
            disabled={syncRemindersMutation.isPending}
            className="w-full"
          >
            {syncRemindersMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                מסנכרן...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 ml-2" />
                סנכרן תזכורות עכשיו
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}