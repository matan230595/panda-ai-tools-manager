import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function toDateOnly(date) {
  return date.toISOString().split('T')[0];
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function subtractDays(value, days) {
  const date = new Date(value);
  date.setDate(date.getDate() - days);
  return date;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const today = startOfDay(new Date());

    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ isActive: true });
    const existingReminders = await base44.asServiceRole.entities.Reminder.filter({
      reminderType: 'subscription_expiry',
      isCompleted: false,
      isActive: true,
    });
    const users = await base44.asServiceRole.entities.User.list();
    const userMap = Object.fromEntries(users.map((user) => [user.id, user]));

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const subscription of subscriptions) {
      if (!subscription.renewalDate || !subscription.created_by_id) {
        skipped++;
        continue;
      }

      const renewalDate = startOfDay(`${subscription.renewalDate}T00:00:00`);
      if (Number.isNaN(renewalDate.getTime()) || renewalDate < today) {
        skipped++;
        continue;
      }

      const owner = userMap[subscription.created_by_id];
      if (!owner?.email) {
        skipped++;
        continue;
      }

      const reminderDate = subtractDays(renewalDate, 7);
      const payload = {
        toolId: subscription.toolId,
        toolName: subscription.toolName,
        recipientEmail: owner.email,
        reminderType: 'subscription_expiry',
        reminderDate: toDateOnly(reminderDate),
        reminderTime: '09:00',
        message: `המנוי של ${subscription.toolName} מסתיים בתאריך ${toDateOnly(renewalDate)}. זה הזמן להחליט אם להמשיך או לבטל.`,
        priority: Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24)) <= 7 ? 'high' : 'medium',
        daysBeforeAlert: 7,
        subscriptionRenewalDate: toDateOnly(renewalDate),
        isActive: true,
        isCompleted: false,
      };

      const existingReminder = existingReminders.find((reminder) =>
        reminder.toolId === subscription.toolId &&
        reminder.subscriptionRenewalDate === payload.subscriptionRenewalDate &&
        reminder.recipientEmail === payload.recipientEmail
      );

      if (existingReminder) {
        await base44.asServiceRole.entities.Reminder.update(existingReminder.id, payload);
        updated++;
      } else {
        await base44.asServiceRole.entities.Reminder.create(payload);
        created++;
      }
    }

    return Response.json({
      success: true,
      checked: subscriptions.length,
      created,
      updated,
      skipped,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});