import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, TrendingUp, DollarSign, MoreHorizontal } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export default function TabNavigation({ activeTab, onTabChange }) {
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        const list = await base44.entities.Settings.filter({ created_by_id: user.id });
        return list[0] || null;
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (settings?.userLogo) {
      setUserLogo(settings.userLogo);
    }
    if (settings?.appName) {
      setAppName(settings.appName);
    }
  }, [settings]);

  const tabs = [
    { id: 'tools', label: 'כלים', icon: Sparkles, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'assistant', label: 'עוזר', icon: MessageSquare, gradient: 'from-fuchsia-500 to-purple-500' },
    { id: 'stats', label: 'ROI', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'dashboard', label: 'דשבורד', icon: '📊', gradient: 'from-sky-500 to-blue-500' },
    { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { id: 'budget', label: 'תקציב', icon: '💰', gradient: 'from-emerald-500 to-lime-500' },
    { id: 'reminders', label: 'תזכורות', icon: '⏰', gradient: 'from-orange-500 to-red-500' },
    { id: 'templates', label: 'תבניות', icon: '📦', gradient: 'from-purple-500 to-pink-500' },
    { id: 'insights', label: 'תובנות', icon: '🧠', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'integrations', label: 'אינטגרציות', icon: '🔗', gradient: 'from-teal-500 to-green-500' },
    { id: 'collaboration', label: 'צוות', icon: TrendingUp, gradient: 'from-teal-500 to-cyan-500' },
    { id: 'settings', label: 'הגדרות', icon: Settings, gradient: 'from-gray-500 to-slate-500' },
  ];

  const primaryMobileTabs = useMemo(() => [
    tabs.find((tab) => tab.id === 'tools'),
    tabs.find((tab) => tab.id === 'stats'),
    tabs.find((tab) => tab.id === 'subscriptions-mgmt'),
    tabs.find((tab) => tab.id === 'assistant'),
  ].filter(Boolean), [tabs]);

  const secondaryMobileTabs = useMemo(() => tabs.filter((tab) => !primaryMobileTabs.some((item) => item.id === tab.id)), [tabs, primaryMobileTabs]);
  const isSecondaryActive = secondaryMobileTabs.some((tab) => tab.id === activeTab);

  const renderTabButton = (tab, isActive, compact = false) => {
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        role="tab"
        aria-selected={isActive}
        aria-label={tab.label}
        className={compact
          ? 'flex flex-col items-center justify-center gap-1 py-1.5 relative touch-target min-h-[72px] rounded-2xl active:scale-95 transition-transform'
          : `relative flex items-center gap-1.5 px-3 lg:px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ease-out whitespace-nowrap ${isActive ? 'text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        {!compact && isActive && <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg opacity-100`} />}
        {compact ? (
          <>
            <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-70'}`}>
              {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-2xl opacity-20`} />}
              {typeof tab.icon === 'string' ? (
                <span className="text-xl relative z-10">{tab.icon}</span>
              ) : (
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
              )}
            </div>
            <span className={`text-[11px] font-medium transition-all duration-300 ${isActive ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent` : 'text-gray-600 dark:text-gray-400'}`}>
              {tab.label}
            </span>
            {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />}
          </>
        ) : (
          <>
            {typeof tab.icon === 'string' ? (
              <span className="text-base relative z-10">{tab.icon}</span>
            ) : (
              <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
            )}
            <span className="relative z-10 hidden lg:inline">{tab.label}</span>
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="hidden md:block sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 gap-4 h-auto">
            <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                {userLogo ? (
                  <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <div className="min-w-0 text-right hidden sm:block">
                <h1 className="text-base font-bold gradient-text truncate">{appName}</h1>
              </div>
            </div>

            <nav className="flex gap-1 flex-1 justify-start overflow-x-auto scrollbar-hide px-1" role="tablist">
              {tabs.map((tab) => renderTabButton(tab, activeTab === tab.id, false))}
            </nav>

            <div className="w-10 flex-shrink-0" />
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] pb-[max(10px,env(safe-area-inset-bottom))]" dir="rtl">
        <nav className="grid grid-cols-5 gap-1 min-h-[92px] px-2 pt-2 max-w-xl mx-auto" role="tablist">
          {primaryMobileTabs.map((tab) => renderTabButton(tab, activeTab === tab.id, true))}

          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button
                aria-label="עוד אפשרויות"
                className="flex flex-col items-center justify-center gap-1 py-1.5 relative touch-target min-h-[72px] rounded-2xl active:scale-95 transition-transform"
              >
                <div className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 ${isSecondaryActive ? 'scale-105' : 'opacity-70'}`}>
                  {isSecondaryActive && <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl opacity-20" />}
                  <MoreHorizontal className={`w-5 h-5 relative z-10 ${isSecondaryActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                <span className={`text-[11px] font-medium ${isSecondaryActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  עוד
                </span>
                {isSecondaryActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />}
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-white dark:bg-slate-950 rounded-t-3xl">
              <DrawerHeader>
                <DrawerTitle>ניווט מהיר</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8 space-y-2 max-h-[70vh] overflow-y-auto">
                <a href="/calendar" className="flex items-center justify-between rounded-2xl border p-4 text-sm font-medium min-h-[52px]">
                  <span>לוח שנה מנויים</span>
                  <span className="text-xl">🗓️</span>
                </a>
                {secondaryMobileTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    className="w-full justify-between min-h-[52px] rounded-2xl"
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsMoreOpen(false);
                    }}
                  >
                    <span>{tab.label}</span>
                    <span>{typeof tab.icon === 'string' ? tab.icon : '•'}</span>
                  </Button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </nav>
      </div>

      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2.5" dir="rtl">
        <div className="flex items-center gap-2 sm:gap-3 justify-between">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
            {userLogo ? (
              <img src={userLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-indigo-500" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h1 className="text-base sm:text-lg font-bold gradient-text truncate">{appName}</h1>
          </div>
        </div>
      </div>
    </>
  );
}