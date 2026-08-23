import React, { useState, useEffect, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Link } from 'react-router-dom';
import { CalendarDays, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '@/components/effects/AnimatedBackground';
import GlobalSearchBar from '@/components/GlobalSearchBar';
import TabNavigation from '@/components/TabNavigation';
import ToolsTab from '@/components/tabs/ToolsTab';
import AssistantTab from '@/components/tabs/AssistantTab';
import SubscriptionsTab from '@/components/tabs/SubscriptionsTab';
import StatsTab from '@/components/tabs/StatsTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import QuickAddFAB from '@/components/QuickAddFAB';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useSmartNotifications } from '@/components/hooks/useSmartNotifications';
import { useKeyboardShortcuts } from '@/components/hooks/useKeyboardShortcuts';
import { Toaster } from 'sonner';
import SuspenseFallback from '@/components/ui/SuspenseFallback';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const InsightsTab = React.lazy(() => import('@/components/tabs/InsightsTab'));
const IntegrationsTab = React.lazy(() => import('@/components/tabs/IntegrationsTab'));
const CollaborationTab = React.lazy(() => import('@/components/tabs/CollaborationTab'));
const BudgetTab = React.lazy(() => import('@/components/tabs/BudgetTab'));
const RemindersTab = React.lazy(() => import('@/components/tabs/RemindersTab'));
const LearningDashboard = React.lazy(() => import('@/components/tools/LearningDashboard'));
const WeeklyReport = React.lazy(() => import('@/components/tools/WeeklyReport'));
const DashboardTab = React.lazy(() => import('@/pages/Dashboard'));
const SubscriptionMgmt = React.lazy(() => import('@/components/subscription/SubscriptionManagementPanel'));

export default function Home() {
  const [activeTab, setActiveTab] = useState('tools');
  const [toolsFilter, setToolsFilter] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [quickAddTool, setQuickAddTool] = useState(false);
  const queryClient = useQueryClient();


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
      const settingsList = await base44.entities.Settings.filter({ created_by_id: user.id });
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
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  }, [activeTab, settings]);

  // טעינת טאב אחרון בהפעלה
  useEffect(() => {
    if (settings?.lastActiveTab) {
      setActiveTab(settings.lastActiveTab === 'templates' ? 'tools' : settings.lastActiveTab);
    }
  }, [settings?.lastActiveTab]);

  // ניהול התראות
  const handleMarkAsRead = (notificationId) => {
    if (!settings) return;
    const updatedNotifications = (settings.notifications || []).map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    base44.entities.Settings.update(settings.id, { notifications: updatedNotifications });
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  const handleClearAllNotifications = () => {
    if (!settings) return;
    base44.entities.Settings.update(settings.id, { notifications: [] });
    queryClient.invalidateQueries({ queryKey: ['settings'] });
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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0d12]">
        <div className="w-10 h-10 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  // אם לא מאומת - הצג מסך התחברות
  if (authStatus !== 'authenticated') {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-hidden bg-[#0b0d12]">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(52,152,219,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,152,219,0.5) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-[-10%] right-[-5%] w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[100px]" />
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative rounded-2xl border border-cyan-400/20 bg-[#1a202d]/80 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(0,212,255,0.2)] p-5 sm:p-8 w-full max-w-sm text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_-4px_rgba(37,99,235,0.6)]"
          >
            <span className="text-3xl sm:text-4xl">🔐</span>
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">AI Tools Manager</h1>
          <p className="text-sm sm:text-base text-slate-400 mb-6">התחבר כדי להמשיך למערכת שלך</p>
          <button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full bg-blue-600 text-white font-bold py-2.5 sm:py-3 rounded-xl hover:bg-blue-500 hover:shadow-[0_0_24px_-4px_rgba(37,99,235,0.6)] transition-all active:scale-95 min-h-[44px] sm:min-h-[48px]"
          >
            התחבר עם Base44
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0b0d12] text-slate-200">
      <OnboardingWizard />
      <AnimatedBackground />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[200] focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        דלג לתוכן הראשי
      </a>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton
        dir="rtl"
        toastOptions={{
          style: { fontFamily: 'Heebo', background: '#1a202d', color: '#e2e8f0', border: '1px solid rgba(52,152,219,0.2)' }
        }}
      />
      
      {/* ניווט */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* תוכן הטאב */}
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 md:pr-[var(--sidebar-w,21rem)] transition-[padding] duration-300 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center justify-between gap-2 mb-3 md:mb-5 rounded-xl border border-cyan-400/15 bg-[#1a202d]/60 backdrop-blur-xl px-3 py-2.5"
        >
          <Link to="/calendar" className="group inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)] hover:bg-blue-500 transition-all active:scale-95 min-h-[44px]">
            <CalendarDays className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">לוח שנה</span>
            <CalendarDays className="w-4 h-4 sm:hidden" />
          </Link>
          <GlobalSearchBar onNavigateTool={() => setActiveTab('tools')} />
          <div className="flex items-center gap-1.5">
            <NotificationCenter 
              notifications={settings?.notifications || []}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAllNotifications}
            />
            <ThemeToggle />
          </div>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'tools' && <ToolsTab settings={settings} initialFilter={toolsFilter} quickAddTool={quickAddTool} onQuickAddDone={() => setQuickAddTool(false)} />}
            {activeTab === 'assistant' && <AssistantTab />}
            {activeTab === 'subscriptions' && <SubscriptionsTab />}
            {activeTab === 'stats' && <StatsTab onNavigateToTools={handleNavigateToTools} />}
            {activeTab === 'insights' && (
              <Suspense fallback={<SuspenseFallback />}>
                <InsightsTab />
              </Suspense>
            )}
            {activeTab === 'integrations' && (
              <Suspense fallback={<SuspenseFallback />}>
                <IntegrationsTab />
              </Suspense>
            )}
            {activeTab === 'collaboration' && (
              <Suspense fallback={<SuspenseFallback />}>
                <CollaborationTab />
              </Suspense>
            )}
            {activeTab === 'budget' && (
              <Suspense fallback={<SuspenseFallback />}>
                <BudgetTab />
              </Suspense>
            )}
            {activeTab === 'reminders' && (
              <Suspense fallback={<SuspenseFallback />}>
                <RemindersTab />
              </Suspense>
            )}
            {activeTab === 'learning' && (
              <Suspense fallback={<SuspenseFallback />}>
                <LearningDashboard onToolClick={() => setActiveTab('tools')} />
              </Suspense>
            )}
            {activeTab === 'weekly-report' && (
              <Suspense fallback={<SuspenseFallback />}>
                <WeeklyReport onToolClick={() => setActiveTab('tools')} />
              </Suspense>
            )}
            {activeTab === 'dashboard' && (
              <Suspense fallback={<SuspenseFallback />}>
                <DashboardTab />
              </Suspense>
            )}
            {activeTab === 'subscriptions-mgmt' && (
              <Suspense fallback={<SuspenseFallback />}>
                <SubscriptionMgmt />
              </Suspense>
            )}
            {activeTab === 'settings' && <SettingsTab settings={settings} onLogout={() => base44.auth.logout(window.location.href)} />}
          </motion.div>
        </AnimatePresence>
      </main>
      


      {/* כפתור פעולה מהירה במובייל */}
      <QuickAddFAB
        onAddTool={() => { setActiveTab('tools'); setQuickAddTool(true); }}
        onStartChat={() => setActiveTab('assistant')}
      />

      {/* עזרת קיצורי מקלדת */}
      <KeyboardShortcutsHelp open={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />

    </div>
  );
}