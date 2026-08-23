import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/components/hooks/userScopedData';
import { Sparkles, MessageSquare, Settings, BarChart3, DollarSign, Menu, Wallet, LayoutDashboard, BellRing, Lightbulb, Cable, Users, CalendarDays, ChevronsLeft, ChevronsRight, GraduationCap, CalendarRange } from 'lucide-react';
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
        className={`group relative w-full flex items-center justify-center rounded-xl py-2.5 transition-all duration-300 ${active
          ? 'bg-blue-600 text-white shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)] border border-cyan-400/30'
          : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent'}`}
      >
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        {active && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-l-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />}
      </button>);
  }
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 rounded-xl transition-all duration-300 active:scale-95 px-3 py-2.5 ${active
        ? 'bg-blue-600 text-white shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)] border border-cyan-400/30'
        : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="text-sm font-medium">{tab.label}</span>
      {active && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-l-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />}
    </button>);
}

const MAIN_TABS = [
  { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard },
  { id: 'tools', label: 'כלים', icon: Sparkles },
  { id: 'assistant', label: 'סוכן', icon: MessageSquare },
  { id: 'subscriptions-mgmt', label: 'מנויים', icon: DollarSign },
  { id: 'stats', label: 'ROI', icon: BarChart3 },
  { id: 'reminders', label: 'התראות', icon: BellRing },
  { id: 'learning', label: 'למידה', icon: GraduationCap },
  { id: 'weekly-report', label: 'דוח שבועי', icon: CalendarRange }
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
      {/* סרגל צד דסקטופ — זכוכית כהה */}
      <aside
        className="hidden md:flex fixed top-0 right-0 h-screen z-50 border-l border-cyan-400/15 bg-[#0e1118]/80 backdrop-blur-2xl flex-col transition-all duration-300 px-1.5 py-3"
        dir="rtl"
        style={{ width: collapsed ? '5.5rem' : '16rem' }}
      >
        {/* כותרת — לוגו + שם */}
        <div className={`flex items-center gap-3 rounded-xl border border-cyan-400/15 p-2.5 mb-3 bg-white/[0.03] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center bg-blue-600 flex-shrink-0 shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)]">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-6 h-6 text-white" />}
          </div>
          {!collapsed &&
            <div className="min-w-0 text-right">
              <div className="text-xs text-slate-500">מערכת ניהול</div>
              <h2 className="font-bold text-sm truncate text-white">{appName}</h2>
            </div>
          }
        </div>

        <Button
          variant="ghost"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`rounded-xl min-h-[40px] mb-3 text-slate-400 hover:text-cyan-300 hover:bg-white/5 ${collapsed ? 'w-full px-0' : 'w-full justify-between'}`}
          title={collapsed ? 'הרחב תפריט' : 'צמצם תפריט'}
        >
          {!collapsed && <span className="text-xs">צמצם תפריט</span>}
          {collapsed ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
        </Button>

        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide pl-1 -ml-1 space-y-3">
          <div className="space-y-1">
            {!collapsed && <div className="px-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">עיקרי</div>}
            {mainTabs.map((tab) => <NavButton key={tab.id} tab={tab} collapsed={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>

          <div className="space-y-1">
            {!collapsed && <div className="px-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">הגדרות ומערכת</div>}
            {secondaryTabs.map((tab) => <NavButton key={tab.id} tab={tab} collapsed={collapsed} active={activeTab === tab.id} onClick={() => onTabChange(tab.id)} />)}
          </div>
        </div>

        <div className="pt-3 flex-shrink-0">
          <Button variant="ghost" className={`w-full rounded-xl min-h-[40px] text-slate-400 hover:text-cyan-300 hover:bg-white/5 ${collapsed ? 'px-0' : 'justify-between'}`} onClick={() => window.location.assign('/calendar')} title="לוח שנה">
            {!collapsed && <span className="text-sm">לוח שנה</span>}
            <CalendarDays className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* סרגל עליון מובייל */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0e1118]/80 backdrop-blur-2xl border-b border-cyan-400/15 px-3 py-2.5" dir="rtl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNavDrawerOpen(true)}
            className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-600 text-white active:scale-95 transition-all flex-shrink-0 shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)]"
            aria-label="פתח תפריט ניווט"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-blue-600 flex-shrink-0 shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)]">
            {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-4 h-4 text-white" />}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h2 className="font-bold text-sm truncate text-white">{appName}</h2>
            <div className="text-[11px] text-slate-500">{allTabs.find((t) => t.id === activeTab)?.label || 'מערכת ניהול'}</div>
          </div>
        </div>
      </div>

      {/* תפריט צד נשלף למובייל */}
      <Sheet open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-[#0e1118]/95 backdrop-blur-2xl border-l border-cyan-400/15" dir="rtl">
          <SheetHeader className="flex flex-row items-center justify-between border-b border-cyan-400/15 p-4 space-y-0">
            <SheetTitle className="text-lg font-bold text-right text-white">תפריט ניווט</SheetTitle>
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-blue-600 shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)]">
              {userLogo ? <img src={userLogo} alt="Logo" className="w-full h-full object-contain" /> : <Sparkles className="w-4 h-4 text-white" />}
            </div>
          </SheetHeader>
          <div className="px-3 py-4 overflow-y-auto flex-1 space-y-5 h-[calc(100vh-4rem)]">
            <div className="space-y-1">
              <div className="px-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">עיקרי</div>
              {mainTabs.map((tab, i) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    onClick={() => { onTabChange(tab.id); setNavDrawerOpen(false); }}
                    className={`group w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-95 ${active
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)] border border-cyan-400/30'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="space-y-1">
              <div className="px-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">הגדרות ומערכת</div>
              {secondaryTabs.map((tab, i) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (i + mainTabs.length) * 0.04, duration: 0.3 }}
                    onClick={() => { onTabChange(tab.id); setNavDrawerOpen(false); }}
                    className={`group w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-all active:scale-95 ${active
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_-4px_rgba(37,99,235,0.6)] border border-cyan-400/30'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-cyan-400/10">
              <Button variant="ghost" className="group w-full justify-between rounded-xl min-h-[44px] text-slate-400 hover:text-cyan-300 hover:bg-white/5" onClick={() => { window.location.assign('/calendar'); }}>
                <span>לוח שנה</span>
                <CalendarDays className="w-4 h-4 transition-transform group-hover:rotate-12" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>);
}