import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const tools = await base44.asServiceRole.entities.AiTool.filter({
      hasSubscription: true,
    });
    const existingReminders = await base44.asServiceRole.entities.Reminder.list();

    const today = new Date();
    const createdReminders = [];

    for (const tool of tools) {
      const hasOpenReminder = existingReminders.some((reminder) => (
        reminder.toolId === tool.id &&
        reminder.reminderType === 'subscription_expiry' &&
        !reminder.isCompleted
      ));

      if (hasOpenReminder) continue;

      const renewalDate = new Date(today);
      renewalDate.setDate(renewalDate.getDate() + 30);

      try {
        await base44.asServiceRole.entities.Reminder.create({
          toolId: tool.id,
          toolName: tool.name,
          recipientEmail: tool.created_by,
          reminderType: 'subscription_expiry',
          reminderDate: renewalDate.toISOString().split('T')[0],
          reminderTime: '09:00',
          message: `חידוש מנוי עבור ${tool.name}`,
          priority: 'high',
          daysBeforeAlert: 7,
          subscriptionRenewalDate: renewalDate.toISOString().split('T')[0],
          isActive: true,
        });

        createdReminders.push({
          id: tool.id,
          name: tool.name,
          status: 'reminder_created',
        });
      } catch (error) {
        console.error(`Failed to create reminder for ${tool.name}:`, error);
      }
    }

    return Response.json({
      success: true,
      checked: tools.length,
      newReminders: createdReminders.length,
      tools: createdReminders,
    });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});