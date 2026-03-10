import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // קבל את כל התזכורות הפעילות שלא בוצעו
    const reminders = await base44.entities.Reminder.filter({
      isActive: true,
      isCompleted: false
    });

    if (reminders.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No pending reminders' });
    }

    // בדוק תאריך היום
    const today = new Date().toISOString().split('T')[0];
    const dueDateReminders = reminders.filter(r => r.reminderDate === today);

    if (dueDateReminders.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No reminders due today' });
    }

    // שלח תזכורות
    const response = await base44.functions.invoke('sendReminderNotification', {
      reminderIds: dueDateReminders.map(r => r.id)
    });

    return Response.json(response.data);

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});