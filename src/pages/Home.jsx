import React, { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { useNavigate } from 'react-router-dom';
import TabNavigation from '@/components/TabNavigation';
import ToolsTab from '@/components/tabs/ToolsTab';
import AssistantTab from '@/components/tabs/AssistantTab';
import SubscriptionsTab from '@/components/tabs/SubscriptionsTab';
import StatsTab from '@/components/tabs/StatsTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import { useSmartNotifications } from '@/components/hooks/useSmartNotifications';
import { useKeyboardShortcuts } from '@/components/hooks/useKeyboardShortcuts';
import { Toaster, toast } from 'sonner';

const InsightsTab = React.lazy(() => import('@/components/tabs/InsightsTab'));
const IntegrationsTab = React.lazy(() => import('@/components/tabs/IntegrationsTab'));
const CollaborationTab = React.lazy(() => import('@/components/tabs/CollaborationTab'));
const BudgetTab = React.lazy(() => import('@/components/tabs/BudgetTab'));
const RemindersTab = React.lazy(() => import('@/components/tabs/RemindersTab'));
const TemplatesTab = React.lazy(() => import('@/components/tabs/TemplatesTab'));
const DashboardTab = React.lazy(() => import('@/pages/Dashboard'));
const SubscriptionMgmt = React.lazy(() => import('@/components/subscription/SubscriptionManagementPanel'));

export default function Home() {
  const [activeTab, setActiveTab] = useState('tools');
  const [toolsFilter, setToolsFilter] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  // בדיקת אימות Base44
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setAuthStatus(authenticated ? 'authenticated' : 'unauthenticated');
    };

    checkAuth();
  }, []);

  // טעינת הגדרות משתמש
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    enabled: authStatus === 'authenticated',
    queryFn: async () => {
      const user = await getCurrentUser();
      const settingsList = await base44.entities.Settings.filter({ created_by: user.email });
      if (settingsList.length > 0) {
        return settingsList[0];
      }
      return await base44.entities.Settings.create({
        theme: 'light',
        language: 'he',
        viewMode: 'grid',
        sortBy: 'updated',
        enableNotifications: true,
        enableKeyboardShortcuts: true,
        lastActiveTab: 'tools',
        preferredModel: 'groq'
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

  // קיצורי מקלדת חכמים
  useKeyboardShortcuts(settings, {
    onTabChange: setActiveTab,
    onSearch: () => {
      if (activeTab === 'tools') {
        const searchInput = document.querySelector('input[type="search"]');
        searchInput?.focus();
      }
    },
    onHelp: () => setShowKeyboardHelp(true),
  });

  // התראות חכמות
  useSmartNotifications(settings, queryClient);

  const handleNavigateToTools = (filter) => {
    setToolsFilter(filter);
    setActiveTab('tools');
  };

  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // אם לא מאומת - הצג מסך התחברות
  if (authStatus !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 w-full max-w-sm text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">🔐</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">AI Tools Manager</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">התחבר כדי להמשיך למערכת שלך</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2.5 sm:py-3 rounded-xl hover:shadow-lg transition-all active:scale-95 min-h-[44px] sm:min-h-[48px] touch-target"
          >
            התחבר עם Base44
          </button>
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
      <div className="hidden md:flex fixed top-4 right-4 z-40 gap-2">
        <NotificationCenter 
          notifications={settings?.notifications || []}
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAllNotifications}
        />
        <ThemeToggle />
      </div>
      
      {/* תוכן הטאב */}
      <main className="max-w-7xl mx-auto px-1.5 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 pb-20 md:pb-8">
        <div className="animate-slide-in">
          {activeTab === 'tools' && <ToolsTab settings={settings} initialFilter={toolsFilter} />}
          {activeTab === 'assistant' && <AssistantTab />}
          {activeTab === 'subscriptions' && <SubscriptionsTab />}
          {activeTab === 'stats' && <StatsTab onNavigateToTools={handleNavigateToTools} />}
          {activeTab === 'insights' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <InsightsTab />
            </Suspense>
          )}
          {activeTab === 'integrations' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <IntegrationsTab />
            </Suspense>
          )}
          {activeTab === 'collaboration' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <CollaborationTab />
            </Suspense>
          )}
          {activeTab === 'budget' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <BudgetTab />
            </Suspense>
          )}
          {activeTab === 'reminders' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <RemindersTab />
            </Suspense>
          )}
          {activeTab === 'templates' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <TemplatesTab />
            </Suspense>
          )}
          {activeTab === 'dashboard' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <DashboardTab />
            </Suspense>
          )}
          {activeTab === 'subscriptions-mgmt' && (
            <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
              <SubscriptionMgmt />
            </Suspense>
          )}
          {activeTab === 'settings' && <SettingsTab settings={settings} onLogout={() => base44.auth.logout(window.location.href)} />}
        </div>
      </main>
      
      {/* מקום לניווט תחתון במובייל */}
      <div className="h-20 md:hidden" />

      {/* עזרת קיצורי מקלדת */}
      <KeyboardShortcutsHelp open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />
    </div>
  );
}