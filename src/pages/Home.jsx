import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TabNavigation from '@/components/TabNavigation';
import ToolsTab from '@/components/tabs/ToolsTab';
import AssistantTab from '@/components/tabs/AssistantTab';
import SubscriptionsTab from '@/components/tabs/SubscriptionsTab';
import StatsTab from '@/components/tabs/StatsTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import { Toaster } from 'sonner';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tools');
  const queryClient = useQueryClient();

  // טעינת הגדרות משתמש
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const settingsList = await base44.entities.Settings.list();
      if (settingsList.length > 0) {
        return settingsList[0];
      }
      // יצירת הגדרות ברירת מחדל
      return await base44.entities.Settings.create({
        theme: 'light',
        language: 'he',
        viewMode: 'grid',
        sortBy: 'updated',
        enableNotifications: true,
        enableKeyboardShortcuts: true,
        lastActiveTab: 'tools'
      });
    }
  });

  // שמירת טאב אחרון
  useEffect(() => {
    if (settings && activeTab !== settings.lastActiveTab) {
      base44.entities.Settings.update(settings.id, { lastActiveTab: activeTab });
    }
  }, [activeTab, settings]);

  // טעינת טאב אחרון בהפעלה
  useEffect(() => {
    if (settings?.lastActiveTab) {
      setActiveTab(settings.lastActiveTab);
    }
  }, [settings?.lastActiveTab]);

  // ניהול התראות
  const handleMarkAsRead = (notificationId) => {
    if (!settings) return;
    const updatedNotifications = settings.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    base44.entities.Settings.update(settings.id, { notifications: updatedNotifications });
    queryClient.invalidateQueries(['settings']);
  };

  const handleClearAllNotifications = () => {
    if (!settings) return;
    base44.entities.Settings.update(settings.id, { notifications: [] });
    queryClient.invalidateQueries(['settings']);
  };

  // קיצורי מקלדת
  useEffect(() => {
    if (!settings?.enableKeyboardShortcuts) return;

    const handleKeyPress = (e) => {
      // Alt + מספר למעבר בין טאבים
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch(e.key) {
          case '1':
            setActiveTab('tools');
            e.preventDefault();
            break;
          case '2':
            setActiveTab('assistant');
            e.preventDefault();
            break;
          case '3':
            setActiveTab('subscriptions');
            e.preventDefault();
            break;
          case '4':
            setActiveTab('stats');
            e.preventDefault();
            break;
          case '5':
            setActiveTab('settings');
            e.preventDefault();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [settings?.enableKeyboardShortcuts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        dir="rtl"
        toastOptions={{
          style: { fontFamily: 'Heebo' }
        }}
      />
      
      {/* ניווט */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* כפתורים - desktop */}
      <div className="hidden md:flex fixed top-6 left-6 z-40 gap-2">
        <NotificationCenter 
          notifications={settings?.notifications || []}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAllNotifications}
        />
        <ThemeToggle />
      </div>
      
      {/* תוכן הטאב */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="animate-slide-in">
          {activeTab === 'tools' && <ToolsTab settings={settings} />}
          {activeTab === 'assistant' && <AssistantTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'settings' && <SettingsTab settings={settings} />}
        </div>
      </main>
      
      {/* מקום לניווט תחתון במובייל */}
      <div className="h-20 md:hidden" />
    </div>
  );
}