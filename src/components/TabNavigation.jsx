import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, DollarSign, MoreHorizontal, Wallet, LayoutDashboard, BellRing, Lightbulb, Cable, Users, CalendarDays, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

export default function TabNavigation({ activeTab, onTabChange }) {
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1');

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '6.75rem' : '21rem');
    localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
  }, [collapsed]);

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

  const mainTabs = [
    { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
    { id: 'tools', label: 'כלים', icon: Sparkles },
    { id: 'assistant', label: 'סוכן', icon: MessageSquare },
    { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign },
    { id: 'stats', label: 'ROI', icon: BarChart3 },
    { id: 'reminders', label: 'התראות', icon: BellRing },
  ];

  const secondaryTabs = [
    { id: 'budget', label: 'תקציב', icon: Wallet },
    { id: 'insights', label: 'תובנות', icon: Lightbulb },
    { id: 'integrations', label: 'אינטגרציות', icon: Cable },
    { id: 'collaboration', label: 'שיתוף', icon: Users },
    { id: 'settings', label: 'הגדרות', icon: Settings },
  ];

  const mobileTabs = useMemo(() => mainTabs.slice(0, 4), [mainTabs]);
  const mobileMoreTabs = useMemo(() => [...mainTabs.slice(4), ...secondaryTabs], [mainTabs, secondaryTabs]);
  const isMoreActive = mobileMoreTabs.some((tab) => tab.id === activeTab);

  const NavButton = ({ tab, active, compact = false, iconOnly = false, onClick }) => {
    const Icon = tab.icon;
    if (iconOnly) {
      return (
        <button
          onClick={onClick}
          title={tab.label}
          aria-label={tab.label}
          className={`w-full flex items-center justify-center rounded-2xl py-2.5 transition-all ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
        >
          <div className={`flex items-center justify-center rounded-2xl w-10 h-10 ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
            <Icon className="w-5 h-5" />
          </div>
        </button>
      );
    }
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 rounded-2xl transition-all ${compact ? 'flex-col justify-center min-h-[72px] px-1 py-2 text-center' : 'justify-between px-4 py-3'} ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
      >
        <div className={`flex items-center gap-3 ${compact ? 'flex-col gap-1.5' : ''}`}>
          <div className={`flex items-center justify-center rounded-2xl ${compact ? 'w-11 h-11' : 'w-9 h-9'} ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`${compact ? 'text-[11px]' : 'text-sm'} font-medium`}>{tab.label}</span>
        </div>
      </button>
    );
  };

  return (
    <>
      <aside className={`hidden md:flex fixed top-0 right-0 h-screen z-50 border-l border-gray-200 dark:border-slate-800 bg-white/96 dark:bg-slate-950/96 backdrop-blur-xl flex-col p-3 transition-all duration-300 ${collapsed ? 'w-[5.75rem]' : 'w-[19rem]'}`} dir="rtl">
        <div className={`flex items-center gap-3 rounded-3xl border border-gray-200 dark:border-slate-800 p-2.5 mb-3 bg-slate-50/80 dark:bg-slate-900/80 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex-shrink-0">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-6 h-6 text-indigo-500" />}
          </div>
          {!collapsed && (
            <div className="min-w-0 text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">מערכת ניהול</div>
              <h2 className="font-bold text-base truncate">{appName}</h2>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`rounded-2xl min-h-[44px] mb-3 ${collapsed ? 'w-full px-0' : 'w-full justify-between'}`}
          title={collapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
        >
          {!collapsed && <span>צמצם תפריט</span>}
          {collapsed ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </Button>

        <div className="flex-1 overflow-y-auto overscroll-contain pl-1 -ml-1 space-y-4">
          <div className="space-y-1.5">
            {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">עיקרי</div>}
            {mainTabs.map((tab) => <NavButton key={tab.id} tab={tab} iconOnly={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>

          <div className="space-y-1.5">
            {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">הגדרות ומערכת</div>}
            {secondaryTabs.map((tab) => <NavButton key={tab.id} tab={tab} iconOnly={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>
        </div>

        <div className="pt-3 flex-shrink-0">
          <Button variant="outline" className={`w-full rounded-2xl min-h-[48px] ${collapsed ? 'px-0' : 'justify-between'}`} onClick={() => window.location.assign('/calendar')} title="לוח שנה">
            {!collapsed && <span>לוח שנה</span>}
            <CalendarDays className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-white/94 dark:bg-slate-950/94 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-3 py-3" dir="rtl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex-shrink-0">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-5 h-5 text-indigo-500" />}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">ניהול הכלים שלך</div>
            <h2 className="font-bold text-base truncate">{appName}</h2>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-10px_32px_rgba(15,23,42,0.16)]" dir="rtl">
        <nav className="grid grid-cols-5 gap-1 px-2 pt-2 max-w-xl mx-auto">
          {mobileTabs.map((tab) => <NavButton key={tab.id} tab={tab} compact active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          <Drawer open={isMoreOpen} onOpenChange={setIsMoreOpen}>
            <DrawerTrigger asChild>
              <button className={`w-full flex flex-col items-center justify-center min-h-[72px] rounded-2xl px-1 py-2 transition-all ${isMoreActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isMoreActive ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}><MoreHorizontal className="w-5 h-5" /></div>
                <span className="text-[11px] font-medium mt-1.5">עוד</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="rounded-t-[2rem] bg-white dark:bg-slate-950">
              <DrawerHeader><DrawerTitle>עוד אזורים במערכת</DrawerTitle></DrawerHeader>
              <div className="px-4 pb-8 space-y-2 max-h-[70vh] overflow-y-auto">
                <Button variant="outline" className="w-full justify-between rounded-2xl min-h-[54px]" onClick={() => window.location.assign('/calendar')}>
                  <span>לוח שנה מנויים</span>
                  <CalendarDays className="w-4 h-4" />
                </Button>
                {mobileMoreTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'outline'}
                      className="w-full justify-between rounded-2xl min-h-[54px]"
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsMoreOpen(false);
                      }}
                    >
                      <span>{tab.label}</span>
                      <Icon className="w-4 h-4" />
                    </Button>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </nav>
      </div>
    </>
  );
}