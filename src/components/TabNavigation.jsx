import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, DollarSign, Menu, X, Wallet, LayoutDashboard, BellRing, Lightbulb, Cable, Users, CalendarDays, ChevronsLeft, ChevronsRight, GraduationCap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

function NavButton({ tab, active, collapsed, onClick }) {
  const Icon = tab.icon;
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={tab.label}
        aria-label={tab.label}
        className={`w-full flex items-center justify-center rounded-2xl py-2.5 transition-all ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
        <div className={`flex items-center justify-center rounded-2xl w-10 h-10 ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </button>);
  }
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-2xl transition-all active:scale-95 px-3 py-2 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
      <div className={`flex items-center justify-center rounded-xl w-8 h-8 ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium">{tab.label}</span>
    </button>);
}

const MAIN_TABS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { id: 'tools', label: 'כלים', icon: Sparkles },
  { id: 'assistant', label: 'סוכן', icon: MessageSquare },
  { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign },
  { id: 'stats', label: 'ROI', icon: BarChart3 },
  { id: 'reminders', label: 'התראות', icon: BellRing },
  { id: 'learning', label: 'למידה', icon: GraduationCap }
];

const SECONDARY_TABS = [
  { id: 'budget', label: 'תקציב', icon: Wallet },
  { id: 'insights', label: 'תובנות', icon: Lightbulb },
  { id: 'integrations', label: 'אינטגרציות', icon: Cable },
  { id: 'collaboration', label: 'שיתוף', icon: Users },
  { id: 'settings', label: 'הגדרות', icon: Settings }
];

const ALL_TABS = [...MAIN_TABS, ...SECONDARY_TABS];

export default function TabNavigation({ activeTab, onTabChange }) {
  const [userLogo, setUserLogo] = useState('');
  const [appName, setAppName] = useState('AI Tools Manager');
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === '1');

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-w', collapsed ? '5.5rem' : '16rem');
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
    }
  });

  useEffect(() => {
    if (settings?.userLogo) setUserLogo(settings.userLogo);
    if (settings?.appName) setAppName(settings.appName);
  }, [settings]);

  const mainTabs = MAIN_TABS;
  const secondaryTabs = SECONDARY_TABS;
  const allTabs = ALL_TABS;

  return (
    <>
      <aside className={`hidden md:flex fixed top-0 right-0 h-screen z-50 border-l border-gray-200 dark:border-slate-800 bg-white/96 dark:bg-slate-950/96 backdrop-blur-xl flex-col transition-all duration-300 px-1.5 py-3 ${collapsed ? 'w-[5.5rem]' : 'w-[16rem]'}`} dir="rtl">
        <div className={`flex items-center gap-3 rounded-3xl border border-gray-200 dark:border-slate-800 p-2.5 mb-3 bg-slate-50/80 dark:bg-slate-900/80 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex-shrink-0">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-6 h-6 text-indigo-500" />}
          </div>
          {!collapsed &&
          <div className="min-w-0 text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">מערכת ניהול</div>
              <h2 className="font-bold text-base truncate">{appName}</h2>
            </div>
          }
        </div>

        <Button
          variant="outline"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`rounded-2xl min-h-[44px] mb-3 ${collapsed ? 'w-full px-0' : 'w-full justify-between'}`}
          title={collapsed ? 'הרחב תפריט' : 'צמצם תפריט'}>
          
          {!collapsed && <span>צמצם תפריט</span>}
          {collapsed ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </Button>

        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide pl-1 -ml-1 space-y-3">
          <div className="space-y-1.5">
            {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">עיקרי</div>}
            {mainTabs.map((tab) => <NavButton key={tab.id} tab={tab} collapsed={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>

          <div className="space-y-1.5">
            {!collapsed && <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">הגדרות ומערכת</div>}
            {secondaryTabs.map((tab) => <NavButton key={tab.id} tab={tab} collapsed={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>
        </div>

        <div className="pt-3 flex-shrink-0">
          <Button variant="outline" className={`w-full rounded-2xl min-h-[48px] ${collapsed ? 'px-0' : 'justify-between'}`} onClick={() => window.location.assign('/calendar')} title="לוח שנה">
            {!collapsed && <span>לוח שנה</span>}
            <CalendarDays className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-white/94 dark:bg-slate-950/94 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 px-3 py-2.5" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavDrawerOpen(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 active:scale-95 transition-all flex-shrink-0"
            aria-label="פתח תפריט ניווט"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex-shrink-0">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-4 h-4 text-indigo-500" />}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="font-bold text-sm truncate">{appName}</h2>
            <div className="text-[11px] text-gray-500 dark:text-gray-400">{allTabs.find((t) => t.id === activeTab)?.label || 'מערכת ניהול'}</div>
          </div>
        </div>
      </div>

      {/* תפריט צד נשלף למובייל */}
      <Sheet open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-white dark:bg-slate-950" dir="rtl">
          <SheetHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-slate-800 p-4 space-y-0">
            <SheetTitle className="text-lg font-bold text-right">תפריט ניווט</SheetTitle>
          </SheetHeader>
          <div className="px-3 py-4 overflow-y-auto flex-1 space-y-5 h-[calc(100vh-4rem)]">
            <div className="space-y-1.5">
              <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">עיקרי</div>
              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); setNavDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all active:scale-95 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`flex items-center justify-center rounded-xl w-9 h-9 ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5">
              <div className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">הגדרות ומערכת</div>
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); setNavDrawerOpen(false); }}
                    className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 transition-all active:scale-95 ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`flex items-center justify-center rounded-xl w-9 h-9 ${active ? 'bg-white/15' : 'bg-gray-100 dark:bg-slate-800'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
              <Button variant="outline" className="w-full justify-between rounded-2xl min-h-[48px]" onClick={() => { window.location.assign('/calendar'); }}>
                <span>לוח שנה</span>
                <CalendarDays className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>);

}