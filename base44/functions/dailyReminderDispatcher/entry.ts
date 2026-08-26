import { createClientFromRequest } from 'npm:@base44/sdk';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    const dueReminders = await base44.asServiceRole.entities.Reminder.filter({
      isActive: true,
      isCompleted: false,
      reminderDate: today,
      created_by_id: user.id,
    });

    if (dueReminders.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No reminders due today' });
    }

    const response = await base44.asServiceRole.functions.invoke('sendReminderNotification', {
      reminderIds: dueReminders.map((reminder) => reminder.id),
    });

    return Response.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Reminder dispatch failed' }, { status: 500 });
  }
});