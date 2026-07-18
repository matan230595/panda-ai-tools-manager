import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, DollarSign, MoreHorizontal, Wallet } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    if (settings?.userLogo) setUserLogo(settings.userLogo);
    if (settings?.appName) setAppName(settings.appName);
  }, [settings]);

  const tabs = [
    { id: 'tools', label: 'כלים', icon: Sparkles, gradient: 'from-indigo-500 to-purple-500' },
    { id: 'stats', label: 'ROI', icon: BarChart3, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign, gradient: 'from-green-500 to-emerald-500' },
    { id: 'budget', label: 'תקציב', icon: Wallet, gradient: 'from-emerald-500 to-lime-500' },
    { id: 'assistant', label: 'עוזר', icon: MessageSquare, gradient: 'from-fuchsia-500 to-purple-500' },
    { id: 'settings', label: 'הגדרות', icon: Settings, gradient: 'from-gray-500 to-slate-500' },
    { id: 'dashboard', label: 'דשבורד', icon: '📊', gradient: 'from-sky-500 to-blue-500' },
    { id: 'reminders', label: 'תזכורות', icon: '⏰', gradient: 'from-orange-500 to-red-500' },
    { id: 'templates', label: 'תבניות', icon: '📦', gradient: 'from-purple-500 to-pink-500' },
    { id: 'insights', label: 'תובנות', icon: '🧠', gradient: 'from-cyan-500 to-blue-500' },
    { id: 'integrations', label: 'אינטגרציות', icon: '🔗', gradient: 'from-teal-500 to-green-500' },
    { id: 'collaboration', label: 'צוות', icon: '👥', gradient: 'from-teal-500 to-cyan-500' },
  ];

  const desktopPrimaryTabs = useMemo(() => tabs.slice(0, 6), [tabs]);
  const desktopSecondaryTabs = useMemo(() => tabs.slice(6), [tabs]);
  const mobilePrimaryTabs = useMemo(() => tabs.slice(0, 4), [tabs]);
  const mobileSecondaryTabs = useMemo(() => tabs.filter((tab) => !mobilePrimaryTabs.some((item) => item.id === tab.id)), [tabs, mobilePrimaryTabs]);
  const isDesktopSecondaryActive = desktopSecondaryTabs.some((tab) => tab.id === activeTab);
  const isMobileSecondaryActive = mobileSecondaryTabs.some((tab) => tab.id === activeTab);

  const renderIcon = (tab, isActive, size = 'md') => {
    const Icon = tab.icon;
    const className = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-5 h-5' : 'w-[18px] h-[18px]';

    if (typeof Icon === 'string') {
      return <span className={size === 'lg' ? 'text-xl' : 'text-base'}>{Icon}</span>;
    }

    return <Icon className={`${className} ${isActive ? 'text-white md:text-current' : 'text-current'}`} />;
  };

  return (
    <>
      <div className="hidden md:block sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-sm">
                {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-5 h-5 text-indigo-500" />}
              </div>
              <div className="min-w-0 text-right">
                <h1 className="text-base font-bold gradient-text truncate">{appName}</h1>
              </div>
            </div>

            <nav className="flex items-center gap-2 flex-1 justify-start overflow-x-auto scrollbar-hide px-1" role="tablist">
              {desktopPrimaryTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    role="tab"
                    aria-selected={isActive}
                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive ? 'text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    {isActive && <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient}`} />}
                    <span className="relative z-10">{renderIcon(tab, isActive, 'sm')}</span>
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={`rounded-2xl min-h-[44px] ${isDesktopSecondaryActive ? 'border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300' : ''}`}>
                    <MoreHorizontal className="w-4 h-4 ml-2" />
                    עוד
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => window.location.assign('/calendar')}>
                    <span className="ml-2">🗓️</span>
                    לוח שנה מנויים
                  </DropdownMenuItem>
                  {desktopSecondaryTabs.map((tab) => (
                    <DropdownMenuItem key={tab.id} onClick={() => onTabChange(tab.id)}>
                      <span className="ml-2">{typeof tab.icon === 'string' ? tab.icon : '•'}</span>
                      {tab.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 shadow-[0_-12px_40px_rgba(15,23,42,0.18)] pb-[max(12px,env(safe-area-inset-bottom))]" dir="rtl">
        <nav className="grid grid-cols-5 gap-1 min-h-[104px] px-2 pt-2 max-w-xl mx-auto" role="tablist">
          {mobilePrimaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                className="flex flex-col items-center justify-center gap-1.5 py-2 relative min-h-[80px] rounded-[22px] active:scale-95 transition-transform"
              >
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-[20px] transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-75'}`}>
                  {isActive && <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} rounded-[20px] opacity-20`} />}
                  <span className="relative z-10">{renderIcon(tab, isActive, 'lg')}</span>
                </div>
                <span className={`text-[11px] font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {tab.label}
                </span>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />}
              </button>
            );
          })}

          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button
                aria-label="עוד אפשרויות"
                className="flex flex-col items-center justify-center gap-1.5 py-2 relative min-h-[80px] rounded-[22px] active:scale-95 transition-transform"
              >
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-[20px] transition-all duration-300 ${isMobileSecondaryActive ? 'scale-105' : 'opacity-75'}`}>
                  {isMobileSecondaryActive && <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-slate-700 rounded-[20px] opacity-20" />}
                  <MoreHorizontal className={`w-5 h-5 relative z-10 ${isMobileSecondaryActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
                </div>
                <span className={`text-[11px] font-medium ${isMobileSecondaryActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  עוד
                </span>
                {isMobileSecondaryActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />}
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-white dark:bg-slate-950 rounded-t-3xl">
              <DrawerHeader>
                <DrawerTitle>תפריט מורחב</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8 space-y-2 max-h-[70vh] overflow-y-auto">
                <Button variant="outline" className="w-full justify-between min-h-[54px] rounded-2xl" onClick={() => window.location.assign('/calendar')}>
                  <span>לוח שנה מנויים</span>
                  <span>🗓️</span>
                </Button>
                {mobileSecondaryTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    className="w-full justify-between min-h-[54px] rounded-2xl"
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

      <div className="md:hidden sticky top-0 z-40 bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3" dir="rtl">
        <div className="flex items-center gap-3 justify-between">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-5 h-5 text-indigo-500" />}
          </div>
          <div className="flex-1 min-w-0 text-right">
            <h1 className="text-base sm:text-lg font-bold gradient-text truncate">{appName}</h1>
          </div>
        </div>
      </div>
    </>
  );
}