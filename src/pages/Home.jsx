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
  const [toolsFilter, setToolsFilter] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const queryClient = useQueryClient();

  // בדיקת אימות
  useEffect(() => {
    const savedAuth = localStorage.getItem('ai_tools_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    const savedPassword = localStorage.getItem('ai_tools_password') || '123456';
    if (password === savedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('ai_tools_auth', 'true');
      toast.success('התחברת בהצלחה! 🎉');
    } else {
      toast.error('סיסמה שגויה');
    }
  };

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

  const handleNavigateToTools = (filter) => {
    setToolsFilter(filter);
    setActiveTab('tools');
  };

  // אם לא מאומת - הצג מסך התחברות
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">AI Tools Manager</h1>
            <p className="text-gray-600 dark:text-gray-400">הזן סיסמה להמשך</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="הזן סיסמה..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none text-center text-lg tracking-widest"
              autoFocus
            />
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
            >
              התחבר
            </button>
            <p className="text-xs text-center text-gray-500">
              💡 סיסמת ברירת מחדל: 123456
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          {activeTab === 'tools' && <ToolsTab settings={settings} initialFilter={toolsFilter} />}
          {activeTab === 'assistant' && <AssistantTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'stats' && <StatsTab onNavigateToTools={handleNavigateToTools} />}
          {activeTab === 'settings' && <SettingsTab settings={settings} onLogout={() => {
            setIsAuthenticated(false);
            localStorage.removeItem('ai_tools_auth');
          }} />}
        </div>
      </main>
      
      {/* מקום לניווט תחתון במובייל */}
      <div className="h-20 md:hidden" />
    </div>
  );
}