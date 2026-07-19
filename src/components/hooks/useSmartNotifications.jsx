import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';

export function useSmartNotifications(settings, queryClient) {
  const addNotification = useCallback(async (notification) => {
    if (!settings) return;

    const existingNotifications = settings.notifications || [];
    const duplicate = existingNotifications.some((item) => (
      item.title === notification.title &&
      item.message === notification.message &&
      new Date(item.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    ));

    if (duplicate) return;

    const newNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await base44.entities.Settings.update(settings.id, {
      notifications: [...existingNotifications, newNotification],
    });

    queryClient.invalidateQueries(['settings']);

    if (notification.type === 'warning' || notification.type === 'error') {
      toast.warning(notification.message, { duration: 6000 });
    }
  }, [settings, queryClient]);

  const checkApiUsage = useCallback(async () => {
    if (!settings?.trackApiCosts) return;
    const monthlyBudget = settings.monthlyApibudget || 100;
    const user = await getCurrentUser();
    const subscriptions = await base44.entities.Subscription.filter({ created_by_id: user.id });
    const usedBudget = subscriptions.filter((item) => item.isActive).reduce((sum, item) => sum + (item.priceMonthly || 0), 0);
    const usagePercentage = monthlyBudget > 0 ? (usedBudget / monthlyBudget) * 100 : 0;

    if (usagePercentage >= 80 && usagePercentage < 100) {
      await addNotification({
        title: '⚠️ התקציב מתקרב לתקרה',
        message: `נוצלו ${usagePercentage.toFixed(0)}% מהתקציב החודשי (₪${usedBudget.toFixed(0)} מתוך ₪${monthlyBudget})`,
        type: 'warning',
      });
    }

    if (usagePercentage >= 100) {
      await addNotification({
        title: '🚨 חרגת מהתקציב החודשי',
        message: `סך עלויות המנויים הוא ₪${usedBudget.toFixed(0)} מול תקציב של ₪${monthlyBudget}`,
        type: 'error',
      });
    }
  }, [settings, addNotification]);

  const checkImportantUpdates = useCallback(async () => {
    const user = await getCurrentUser();
    const subscriptions = await base44.entities.Subscription.filter({ created_by_id: user.id });
    const toolTasks = await base44.entities.ToolTask.filter({ created_by_id: user.id }).catch(() => []);
    const tools = await base44.entities.AiTool.filter({ created_by_id: user.id }).catch(() => []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // התראה על כלי חדש בקטגוריה שאני עוקב אחריה
    // "קטגוריה שאני עוקב אחריה" = קטגוריה שכבר יש בה לפחות כלי אחד ותיק
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const followedCategories = new Set();
    const categoryCounts = {};
    tools.forEach((t) => {
      const cat = t.customCategory || t.category;
      if (!cat) return;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    Object.keys(categoryCounts).forEach((cat) => {
      if (categoryCounts[cat] >= 2) followedCategories.add(cat);
    });

    for (const tool of tools) {
      const cat = tool.customCategory || tool.category;
      const createdTime = new Date(tool.created_date).getTime();
      const isNew = createdTime > threeDaysAgo;
      if (isNew && followedCategories.has(cat)) {
        await addNotification({
          title: '✨ כלי חדש בקטגוריה שאתה עוקב אחריה',
          message: `הכלי "${tool.name}" נוסף לקטגוריה "${cat?.replace(/_/g, ' ')}".`,
          type: 'info',
        });
      }
    }

    for (const sub of subscriptions.filter((item) => item.isActive && item.renewalDate)) {
      const renewalDate = new Date(`${sub.renewalDate}T00:00:00`);
      const daysLeft = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft === 0) {
        await addNotification({
          title: '🚨 חידוש מנוי היום',
          message: `המנוי של ${sub.toolName} מתחדש היום — כדאי להחליט אם לבטל או לחדש.`,
          type: 'warning',
        });
      } else if (daysLeft > 0 && daysLeft <= 7) {
        await addNotification({
          title: '📅 מנוי מתקרב לחידוש',
          message: `המנוי של ${sub.toolName} יתחדש בעוד ${daysLeft} ימים.`,
          type: daysLeft <= 3 ? 'warning' : 'info',
        });
      }
    }

    for (const task of toolTasks.filter((item) => !item.isCompleted && item.dueDate)) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        await addNotification({
          title: '📝 משימה באיחור',
          message: `המשימה "${task.title}" עבור ${task.toolName} עברה את תאריך היעד.`,
          type: 'warning',
        });
      }
    }
  }, [addNotification]);

  useEffect(() => {
    if (!settings) return;
    checkApiUsage();
    checkImportantUpdates();
    const interval = setInterval(() => {
      checkApiUsage();
      checkImportantUpdates();
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings, checkApiUsage, checkImportantUpdates]);

  return { addNotification };
}