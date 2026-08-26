import { createClientFromRequest } from 'npm:@base44/sdk';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const reminderIds = Array.isArray(body.reminderIds) ? body.reminderIds : [];

    if (reminderIds.length === 0) {
      return Response.json({ success: true, sent: 0, failed: 0, total: 0 });
    }

    const allReminders = await base44.asServiceRole.entities.Reminder.list();
    const reminders = allReminders.filter((reminder) => {
      if (!reminderIds.includes(reminder.id)) return false;
      return reminder.created_by_id === user.id || reminder.created_by === user.email;
    });

    let successCount = 0;
    let failureCount = 0;

    for (const reminder of reminders) {
      try {
        const recipientEmail = user.email;

        if (!recipientEmail) {
          failureCount++;
          continue;
        }

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientEmail,
          subject: `תזכורת: ${String(reminder.toolName || 'כלי AI').slice(0, 120)}`,
          body: `
            <div dir="rtl">
              <h2>תזכורת: ${escapeHtml(reminder.toolName || 'כלי AI')}</h2>
              <p><strong>הודעה:</strong> ${escapeHtml(reminder.message)}</p>
              <p><strong>סוג:</strong> ${escapeHtml(reminder.reminderType)}</p>
              <p><strong>עדיפות:</strong> ${escapeHtml(reminder.priority)}</p>
              <hr>
              <p>תאריך: ${escapeHtml(reminder.reminderDate)} בשעה ${escapeHtml(reminder.reminderTime || '09:00')}</p>
            </div>
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
    return Response.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
});