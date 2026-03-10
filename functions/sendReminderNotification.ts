import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const reminderIds = Array.isArray(body.reminderIds) ? body.reminderIds : [];

    if (reminderIds.length === 0) {
      return Response.json({ success: true, sent: 0, failed: 0, total: 0 });
    }

    const allReminders = await base44.asServiceRole.entities.Reminder.list();
    const reminders = allReminders.filter((reminder) => reminderIds.includes(reminder.id));

    let successCount = 0;
    let failureCount = 0;

    for (const reminder of reminders) {
      try {
        const recipientEmail = reminder.recipientEmail || reminder.created_by;

        if (!recipientEmail) {
          failureCount++;
          continue;
        }

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: `תזכורת: ${reminder.toolName}`,
          body: `
            <h2>תזכורת: ${reminder.toolName}</h2>
            <p><strong>הודעה:</strong> ${reminder.message}</p>
            <p><strong>סוג:</strong> ${reminder.reminderType}</p>
            <p><strong>עדיפות:</strong> ${reminder.priority}</p>
            <hr>
            <p>תאריך: ${reminder.reminderDate} בשעה ${reminder.reminderTime || '09:00'}</p>
          `,
        });

        await base44.asServiceRole.entities.Reminder.update(reminder.id, {
          isCompleted: true,
          completedDate: new Date().toISOString(),
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
      total: reminders.length,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});