import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/**
 * Hook לניהול התראות חכמות על עדכונים חשובים ושימוש חריג ב-API
 */
export function useSmartNotifications(settings, queryClient) {
  const addNotification = useCallback(async (notification) => {
    if (!settings) return;

    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedNotifications = [...(settings.notifications || []), newNotification];
    await base44.entities.Settings.update(settings.id, {
      notifications: updatedNotifications,
    });

    queryClient.invalidateQueries(['settings']);

    // הצג toast אם התראה חשובה
    if (notification.type === 'warning' || notification.type === 'error') {
      toast.warning(notification.message, { duration: 6000 });
    }
  }, [settings, queryClient]);

  // בדוק שימוש חריג בתקציב
  const checkApiUsage = useCallback(async () => {
    if (!settings?.trackApiCosts) return;

    const monthlyBudget = settings.monthlyApibudget || 100;
    const subscriptions = await base44.entities.Subscription.list();
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
      const tools = await base44.entities.AiTool.list();
      const subscriptions = await base44.entities.Subscription.list();

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

      // בדוק כלים שלא בשימוש זמן רב
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      tools.forEach(tool => {
        const lastUsed = tool.lastUsed ? new Date(tool.lastUsed) : null;
        if (lastUsed && lastUsed < thirtyDaysAgo) {
          addNotification({
            title: '💤 כלי לא בשימוש',
            message: `${tool.name} לא שומש במשך יותר מ-30 ימים`,
            type: 'info',
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