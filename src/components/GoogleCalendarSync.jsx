import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleCalendarSync() {
  const queryClient = useQueryClient();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const list = await base44.entities.Settings.list();
      return list[0];
    },
  });

  const syncRemindersMutation = useMutation({
    mutationFn: async () => {
      // Get all active reminders
      const reminders = await base44.entities.Reminder.filter({
        isActive: true,
        isCompleted: false
      });

      if (reminders.length === 0) {
        throw new Error('אין תזכורות פעילות');
      }

      // Create calendar events for each reminder
      const events = reminders.map(r => ({
        title: `תזכורת: ${r.toolName}`,
        description: r.message,
        startTime: `${r.reminderDate}T${r.reminderTime}:00`,
        endTime: `${r.reminderDate}T${r.reminderTime}:30`,
      }));

      // Call integration to sync with Google Calendar
      return base44.functions.invoke('syncGoogleCalendar', { events });
    },
    onSuccess: (res) => {
      toast.success(`סונכרן ${res.data.synced} אירועים לקלנדר! 📅`);
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Trigger OAuth flow
      const result = await base44.functions.invoke('initiateGoogleOAuth', {});
      if (result.data.authUrl) {
        window.open(result.data.authUrl, '_blank', 'width=500,height=600');
      }
    } catch (error) {
      toast.error('שגיאה בחיבור לקלנדר');
    } finally {
      setIsConnecting(false);
    }
  };

  const isConnected = settings?.googleConnected;

  return (
    <Card className="border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              חבר את קלנדר Google שלך כדי לסנכרן תזכורות אוטומטית
            </p>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מחבר...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 ml-2" />
                  התחבר לקלנדר
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
              <span className="text-sm font-semibold">מחובר לקלנדר</span>
            </div>
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
                  סנכרן תזכורות
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}