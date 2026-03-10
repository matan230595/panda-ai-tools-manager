import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reminderIds } = await req.json();

    if (!reminderIds || !Array.isArray(reminderIds)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const reminders = await base44.entities.Reminder.filter({
      id: { $in: reminderIds }
    });

    const successCount = 0;
    const failureCount = 0;

    for (const reminder of reminders) {
      try {
        // שלח email
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `תזכורת: ${reminder.toolName}`,
          body: `
            <h2>תזכורת: ${reminder.toolName}</h2>
            <p><strong>הודעה:</strong> ${reminder.message}</p>
            <p><strong>סוג:</strong> ${reminder.reminderType}</p>
            <p><strong>עדיפות:</strong> ${reminder.priority}</p>
            <hr>
            <p>תאריך: ${reminder.reminderDate} בשעה ${reminder.reminderTime}</p>
          `
        });

        // עדכן את הזכורת שנשלחה
        await base44.entities.Reminder.update(reminder.id, {
          isCompleted: true,
          completedDate: new Date().toISOString()
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        failureCount++;
      }
    }

    return Response.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: reminders.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});