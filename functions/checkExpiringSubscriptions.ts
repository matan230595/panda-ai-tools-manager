import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // קבל את כל הכלים עם מנוי
    const tools = await base44.entities.AiTool.filter({
      hasSubscription: true
    });

    const today = new Date();
    const expiringTools = [];

    for (const tool of tools) {
      // חפש תזכורת קיימת
      const existingReminder = await base44.entities.Reminder.filter({
        toolId: tool.id,
        reminderType: 'subscription_expiry',
        isCompleted: false
      });

      if (existingReminder.length === 0) {
        // צור תזכורת חדשה
        const renewalDate = new Date(today);
        renewalDate.setDate(renewalDate.getDate() + 30);

        try {
          await base44.entities.Reminder.create({
            toolId: tool.id,
            toolName: tool.name,
            reminderType: 'subscription_expiry',
            reminderDate: renewalDate.toISOString().split('T')[0],
            reminderTime: '09:00',
            message: `חידוש מנוי עבור ${tool.name}`,
            priority: 'high',
            daysBeforeAlert: 7,
            subscriptionRenewalDate: renewalDate.toISOString().split('T')[0],
            isActive: true
          });

          expiringTools.push({
            id: tool.id,
            name: tool.name,
            status: 'reminder_created'
          });
        } catch (err) {
          console.error(`Failed to create reminder for ${tool.name}:`, err);
        }
      }
    }

    return Response.json({
      success: true,
      checked: tools.length,
      newReminders: expiringTools.length,
      tools: expiringTools
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});