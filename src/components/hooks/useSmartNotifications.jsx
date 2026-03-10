import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';

/**
 * Hook לניהול התראות חכמות על עדכונים חשובים ושימוש חריג ב-API
 */
export function useSmartNotifications(settings, queryClient) {
  const addNotification = useCallback(async (notification) => {
    if (!settings) return;

    const existingNotifications = settings.notifications || [];
    const duplicate = existingNotifications.some((item) => (
      item.title === notification.title &&
      item.message === notification.message &&
      new Date(item.timestamp).getTime() > Date.now() - (12 * 60 * 60 * 1000)
    ));

    if (duplicate) return;

    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedNotifications = [...existingNotifications, newNotification];
    await base44.entities.Settings.update(settings.id, {
      notifications: updatedNotifications,
    });

    queryClient.invalidateQueries(['settings']);

    if (notification.type === 'warning' || notification.type === 'error') {
      toast.warning(notification.message, { duration: 6000 });
    }
  }, [settings, queryClient]);

  // בדוק שימוש חריג בתקציב
  const checkApiUsage = useCallback(async () => {
    if (!settings?.trackApiCosts) return;

    const monthlyBudget = settings.monthlyApibudget || 100;
    const user = await getCurrentUser();
    const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
    const usedBudget = subscriptions.filter(item => item.isActive).reduce((sum, item) => sum + (item.priceMonthly || 0), 0);
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

  // בדוק עדכונים חשובים
  const checkImportantUpdates = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const tools = await base44.entities.AiTool.filter({ created_by: user.email });
      const subscriptions = await base44.entities.Subscription.filter({ created_by: user.email });
      const toolTasks = await base44.entities.ToolTask.filter({ created_by: user.email }).catch(() => []);

      // בדוק מנויים שעומדים להסתיים תוך 7 ימים
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);

      subscriptions.forEach(sub => {
        const renewalDate = new Date(sub.renewalDate);
        if (renewalDate <= soon && renewalDate > new Date()) {
          addNotification({
            title: '📅 עדכון: מנוי עומד להסתיים',
            message: `המנוי של ${sub.toolName} מסתיים ב-${renewalDate.toLocaleDateString('he-IL')}`,
            type: 'info',
          });
        }
      });

      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      toolTasks
        .filter(task => !task.isCompleted)
        .forEach(task => {
          const tool = tools.find(item => item.id === task.toolId);
          const lastUsed = tool?.lastUsed ? new Date(tool.lastUsed) : null;
          if (!lastUsed || lastUsed < fourteenDaysAgo) {
            addNotification({
              title: '📝 משימה ממתינה לכלי לא פעיל',
              message: `יש משימה פתוחה עבור ${task.toolName} אך לא היה שימוש בכלי לאחרונה`,
              type: 'warning',
            });
          }
        });
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }, [addNotification]);

  // הפעל בדיקות כל 5 דקות
  useEffect(() => {
    checkApiUsage();
    checkImportantUpdates();

    const interval = setInterval(() => {
      checkApiUsage();
      checkImportantUpdates();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkApiUsage, checkImportantUpdates]);

  return { addNotification };
}